import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, UserX, LogIn, LogOut, PlayCircle, PauseCircle, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';

interface DeductionItem {
  id: number;
  code: string;
  description: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

type DeductionType = 'absent' | 'no-login' | 'no-logout' | 'no-break2-out' | 'no-break2-in';

export function EquivalentHoursDeductionSetupPage() {
  const [activeTab, setActiveTab] = useState<DeductionType>('absent');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<DeductionItem | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    monday: '0',
    tuesday: '0',
    wednesday: '0',
    thursday: '0',
    friday: '0',
    saturday: '0',
    sunday: '0'
  });

  // Separate data for each tab
  const [absentData, setAbsentData] = useState<DeductionItem[]>([
    {
      id: 1,
      code: 'ABSENT',
      description: 'ABSENT',
      monday: '8.00',
      tuesday: '8.00',
      wednesday: '8.00',
      thursday: '8.00',
      friday: '8.00',
      saturday: '8.00',
      sunday: '8.00'
    }
  ]);

  const [noLoginData, setNoLoginData] = useState<DeductionItem[]>([]);
  const [noLogoutData, setNoLogoutData] = useState<DeductionItem[]>([
    {
      id: 1,
      code: 'NOLOGIN',
      description: 'NOLOGIN',
      monday: '8.00',
      tuesday: '8.00',
      wednesday: '8.00',
      thursday: '8.00',
      friday: '8.00',
      saturday: '8.00',
      sunday: '8.00'
    }
  ]);
  const [noBreak2OutData, setNoBreak2OutData] = useState<DeductionItem[]>([]);
  const [noBreak2InData, setNoBreak2InData] = useState<DeductionItem[]>([]);

  const itemsPerPage = 10;

  // Get current data based on active tab
  const getCurrentData = (): DeductionItem[] => {
    switch (activeTab) {
      case 'absent': return absentData;
      case 'no-login': return noLoginData;
      case 'no-logout': return noLogoutData;
      case 'no-break2-out': return noBreak2OutData;
      case 'no-break2-in': return noBreak2InData;
      default: return [];
    }
  };

  const setCurrentData = (data: DeductionItem[]) => {
    switch (activeTab) {
      case 'absent': setAbsentData(data); break;
      case 'no-login': setNoLoginData(data); break;
      case 'no-logout': setNoLogoutData(data); break;
      case 'no-break2-out': setNoBreak2OutData(data); break;
      case 'no-break2-in': setNoBreak2InData(data); break;
    }
  };

  const currentData = getCurrentData();
  
  const filteredData = currentData.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateNew = () => {
    setFormData({
      code: '',
      description: '',
      monday: '0',
      tuesday: '0',
      wednesday: '0',
      thursday: '0',
      friday: '0',
      saturday: '0',
      sunday: '0'
    });
    setShowCreateModal(true);
  };

  const handleEdit = (item: DeductionItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      description: item.description,
      monday: item.monday,
      tuesday: item.tuesday,
      wednesday: item.wednesday,
      thursday: item.thursday,
      friday: item.friday,
      saturday: item.saturday,
      sunday: item.sunday
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this deduction item?')) {
      setCurrentData(currentData.filter(item => item.id !== id));
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: DeductionItem = {
      id: Math.max(...currentData.map(d => d.id), 0) + 1,
      code: formData.code,
      description: formData.description,
      monday: formData.monday,
      tuesday: formData.tuesday,
      wednesday: formData.wednesday,
      thursday: formData.thursday,
      friday: formData.friday,
      saturday: formData.saturday,
      sunday: formData.sunday
    };
    setCurrentData([...currentData, newItem]);
    setShowCreateModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setCurrentData(
        currentData.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                code: formData.code,
                description: formData.description,
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
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingItem(null);
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showEditModal) {
          setShowEditModal(false);
          setEditingItem(null);
        }
      }
    };

    if (showCreateModal || showEditModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showEditModal]);

    const tabs = [
        { id: 'absent' as DeductionType, label: 'For Absent', icon: UserX },
        { id: 'no-login' as DeductionType, label: 'For No Login', icon: LogIn },
        { id: 'no-logout' as DeductionType, label: 'For No Logout', icon: LogOut },
        { id: 'no-break2-out' as DeductionType, label: 'For No Break2 Out', icon: PlayCircle },
        { id: 'no-break2-in' as DeductionType, label: 'For No Break2 In', icon: PauseCircle }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Equivalent Hours Deduction Setup</h1>
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
                    Process employee timekeeping data by various criteria including TK Group, branch, department, and more. Generate comprehensive reports for tardiness, undertime, overtime, leave, and other attendance metrics.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Process by multiple organizational groups</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Generate comprehensive attendance reports</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Track tardiness, undertime, and overtime</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Monitor leave and absences efficiently</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                    activeTab === tab.id
                      ? 'font-medium bg-blue-600 text-white -mb-px'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
                  >
                   <tab.icon className="w-4 h-4" />
                   {tab.label}
                   {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                   )}
                </button>
              ))}
            </div>

            {/* Top Controls */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>

              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Monday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Tuesday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Wednesday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Thursday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Friday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Saturday</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Sunday</th>
                    <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.monday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.tuesday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.wednesday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.thursday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.friday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.saturday}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.sunday}</td>
                        <td className="px-6 py-4">
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-6 py-16 text-center">
                        <div className="text-gray-500">No data available in table</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    currentPage === 1 ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                  disabled={currentPage >= totalPages || filteredData.length === 0}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Modal */}
      {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h2 className="text-gray-900">Create New</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6">
              <h3 className="text-blue-600 mb-4">Equivalent Hours Deduction</h3>
              
              <div className="space-y-3">
                {/* Code */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Code :
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Description :
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Monday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Monday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monday}
                    onChange={(e) => setFormData({ ...formData, monday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Tuesday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Tuesday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tuesday}
                    onChange={(e) => setFormData({ ...formData, tuesday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Wednesday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Wednesday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wednesday}
                    onChange={(e) => setFormData({ ...formData, wednesday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Thursday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Thursday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.thursday}
                    onChange={(e) => setFormData({ ...formData, thursday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Friday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Friday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.friday}
                    onChange={(e) => setFormData({ ...formData, friday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Saturday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Saturday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saturday}
                    onChange={(e) => setFormData({ ...formData, saturday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Sunday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Sunday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sunday}
                    onChange={(e) => setFormData({ ...formData, sunday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Back to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h2 className="text-gray-900">Create New</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <h3 className="text-blue-600 mb-4">Equivalent Hours Deduction</h3>
              
              <div className="space-y-3">
                {/* Code */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Code :
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Description :
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Monday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Monday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monday}
                    onChange={(e) => setFormData({ ...formData, monday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Tuesday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Tuesday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tuesday}
                    onChange={(e) => setFormData({ ...formData, tuesday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Wednesday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Wednesday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wednesday}
                    onChange={(e) => setFormData({ ...formData, wednesday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Thursday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Thursday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.thursday}
                    onChange={(e) => setFormData({ ...formData, thursday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Friday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Friday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.friday}
                    onChange={(e) => setFormData({ ...formData, friday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Saturday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Saturday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saturday}
                    onChange={(e) => setFormData({ ...formData, saturday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Sunday */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap w-32">
                    Sunday :
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sunday}
                    onChange={(e) => setFormData({ ...formData, sunday: e.target.value })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Back to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
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