import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';

interface AllowanceBracketing {
  id: number;
  noOfHours: string;
  amount: string;
  earningCode: string;
}

interface EarningCode {
  code: string;
  description: string;
}

export function AllowanceBracketingSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEarningCodeModal, setShowEarningCodeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [earningCodeSearchTerm, setEarningCodeSearchTerm] = useState('');
  const [allowanceBracketCode, setAllowanceBracketCode] = useState('');
  const [workshiftCode, setWorkshiftCode] = useState('');
  const [dayType, setDayType] = useState('Regular Day');
  const [includeWithinShift, setIncludeWithinShift] = useState(false);
  const [byEmploymentStatus, setByEmploymentStatus] = useState(false);
  const [formData, setFormData] = useState({ noOfHours: '', amount: '', earningCode: '' });
  const [editingItem, setEditingItem] = useState<AllowanceBracketing | null>(null);
  const [isSelectingForEdit, setIsSelectingForEdit] = useState(false);

  const [bracketingData, setBracketingData] = useState<AllowanceBracketing[]>([]);

  const earningCodes: EarningCode[] = [
    { code: 'E01', description: 'Regular Pay' },
    { code: 'E02', description: 'Overtime' },
    { code: 'E03', description: 'Charge SL/VL' },
    { code: 'E04', description: 'Absences' },
    { code: 'E05', description: 'UT/Tardiness' },
    { code: 'E06', description: '13th Month Pay NonTax' },
    { code: 'E07', description: 'COLA' },
    { code: 'E08', description: 'Transportation Expense Reimbursement Allowance' },
    { code: 'E09', description: 'Onsite Rollform Allowance' },
    { code: 'E10', description: 'Overwithheld' }
  ];

  const filteredEarningCodes = earningCodes.filter(item =>
    item.code.toLowerCase().includes(earningCodeSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(earningCodeSearchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(bracketingData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = bracketingData.slice(startIndex, startIndex + itemsPerPage);

  const earningCodesPerPage = 10;
  const [earningCodePage, setEarningCodePage] = useState(1);
  const earningCodeStartIndex = (earningCodePage - 1) * earningCodesPerPage;
  const paginatedEarningCodes = filteredEarningCodes.slice(earningCodeStartIndex, earningCodeStartIndex + earningCodesPerPage);

  const handleCreateNew = () => {
    setFormData({ noOfHours: '', amount: '', earningCode: '' });
    setShowCreateModal(true);
  };

  const handleEdit = (item: AllowanceBracketing) => {
    setEditingItem(item);
    setFormData({ noOfHours: item.noOfHours, amount: item.amount, earningCode: item.earningCode });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setBracketingData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: AllowanceBracketing = {
      id: Math.max(...bracketingData.map(b => b.id), 0) + 1,
      noOfHours: formData.noOfHours,
      amount: formData.amount,
      earningCode: formData.earningCode
    };
    setBracketingData(prev => [...prev, newEntry]);
    setShowCreateModal(false);
    setFormData({ noOfHours: '', amount: '', earningCode: '' });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setBracketingData(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, noOfHours: formData.noOfHours, amount: formData.amount, earningCode: formData.earningCode }
            : item
        )
      );
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({ noOfHours: '', amount: '', earningCode: '' });
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    setFormData({ noOfHours: '', amount: '', earningCode: '' });
  };

  const handleOpenEarningCodeSearch = (forEdit: boolean = false) => {
    setIsSelectingForEdit(forEdit);
    setEarningCodeSearchTerm('');
    setShowEarningCodeModal(true);
  };

  const handleSelectEarningCode = (code: string) => {
    setFormData({ ...formData, earningCode: code });
    setShowEarningCodeModal(false);
    setEarningCodeSearchTerm('');
  };

  // Handle ESC key press with hierarchy
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close modals in hierarchical order - search modal first, then main modals
        if (showEarningCodeModal) {
          setShowEarningCodeModal(false);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showEditModal) {
          setShowEditModal(false);
          setEditingItem(null);
        }
      }
    };

    if (showCreateModal || showEditModal || showEarningCodeModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCreateModal, showEditModal, showEarningCodeModal]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Allowance Bracketing Setup</h1>
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
                    Configure allowance bracketing rules based on hours worked or other criteria, linking bracket codes with specific earning codes and amounts for automated payroll calculations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Hours-based allowance rules</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Earning code integration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Flexible amount configuration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Automated allowance processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Controls */}
            <div className="mb-6 space-y-4">
              {/* First Row - Create New and Dropdown */}
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>

                <select
                  value={dayType}
                  onChange={(e) => setDayType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option>Regular Day</option>
                  <option>Special Holiday</option>
                  <option>Regular Holiday</option>
                  <option>Rest Day</option>
                </select>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWithinShift}
                    onChange={(e) => setIncludeWithinShift(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Within The Shift</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={byEmploymentStatus}
                    onChange={(e) => setByEmploymentStatus(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">By Employment Status</span>
                </label>
              </div>

              {/* Second Row - Search Fields */}
              <div className="flex items-center gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 relative">
                  <label className="text-sm text-gray-700 whitespace-nowrap">Allowance Bracket Code :</label>
                  <input
                    type="text"
                    value={allowanceBracketCode}
                    onChange={(e) => setAllowanceBracketCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Search
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700 whitespace-nowrap">Workshift Code :</label>
                  <input
                    type="text"
                    value={workshiftCode}
                    onChange={(e) => setWorkshiftCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">No of Hours [hh.mm]</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Earning Code</th>
                    <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.noOfHours}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.amount}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.earningCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="text-gray-500">No data available in table</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                disabled={currentPage >= totalPages || bracketingData.length === 0}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
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
              <h3 className="text-blue-600 mb-4">Allowance Bracketing Setup</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                    No of Hours :
                  </label>
                  <input
                    type="text"
                    value={formData.noOfHours}
                    onChange={(e) => setFormData({ ...formData, noOfHours: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                    Amount :
                  </label>
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="40"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                    EarningCode :
                  </label>
                  <input
                    type="text"
                    value={formData.earningCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                    placeholder="Click Search to select"
                  />
                  <button
                        onClick={() => setShowEmpCodeModal(true)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
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
              <h2 className="text-gray-900">Edit</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <h3 className="text-blue-600 mb-4">Allowance Bracketing Setup</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                    No of Hours :
                  </label>
                  <input
                    type="text"
                    value={formData.noOfHours}
                    onChange={(e) => setFormData({ ...formData, noOfHours: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                    Amount :
                  </label>
                  <input
                    type="text"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">
                    EarningCode :
                  </label>
                  <input
                    type="text"
                    value={formData.earningCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => handleOpenEarningCodeSearch(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
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

      {/* Earning Code Search Modal */}
      {showEarningCodeModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-gray-900">Search</h2>
              <button
                onClick={() => setShowEarningCodeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-blue-600 mb-4">Earnings Code</h3>
              
              {/* Search Input */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={earningCodeSearchTerm}
                  onChange={(e) => setEarningCodeSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedEarningCodes.map((item) => (
                      <tr 
                        key={item.code} 
                        className="hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleSelectEarningCode(item.code)}
                      >
                        <td className="px-6 py-3 text-sm text-gray-900">{item.code}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-gray-600">
                  Showing 1 to {filteredBrackets.length} of {filteredBrackets.length} entries
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}