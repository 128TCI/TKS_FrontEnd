import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';


interface LeaveType {
  id: number;
  code: string;
  description: string;
  chargeableTo: string;
  withPay: boolean;
  noBalance: boolean;
  requiredAdvancedFiling: boolean;
  exemptedFromAllowanceDeduction: boolean;
  legal: boolean;
  special: boolean;
  special2: boolean;
  doubleLegal: boolean;
  nonWorking: boolean;
}

export function LeaveTypeSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<LeaveType | null>(null);
  const [chargeableToSearch, setChargeableToSearch] = useState('');
  const [searchModalTerm, setSearchModalTerm] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    chargeableTo: '',
    withPay: false,
    noBalance: false,
    requiredAdvancedFiling: false,
    exemptedFromAllowanceDeduction: false,
    legal: false,
    special: false,
    special2: false,
    doubleLegal: false,
    nonWorking: false
  });

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    { id: 1, code: 'BL', description: 'Birthday Leave', chargeableTo: 'BL', withPay: false, noBalance: false, requiredAdvancedFiling: false, exemptedFromAllowanceDeduction: false, legal: false, special: false, special2: false, doubleLegal: false, nonWorking: false },
    { id: 2, code: 'HL', description: 'Home Leave', chargeableTo: 'HL', withPay: false, noBalance: false, requiredAdvancedFiling: false, exemptedFromAllowanceDeduction: false, legal: false, special: false, special2: false, doubleLegal: false, nonWorking: false },
    { id: 3, code: 'PL', description: 'Paternity Leave', chargeableTo: 'PL', withPay: false, noBalance: false, requiredAdvancedFiling: false, exemptedFromAllowanceDeduction: false, legal: false, special: false, special2: false, doubleLegal: false, nonWorking: false },
    { id: 4, code: 'SL', description: 'Sick Leave', chargeableTo: 'SL', withPay: false, noBalance: false, requiredAdvancedFiling: false, exemptedFromAllowanceDeduction: false, legal: false, special: false, special2: false, doubleLegal: false, nonWorking: false },
    { id: 5, code: 'SPL', description: 'Solo Parent Leave', chargeableTo: 'SPL', withPay: false, noBalance: false, requiredAdvancedFiling: false, exemptedFromAllowanceDeduction: false, legal: false, special: false, special2: false, doubleLegal: false, nonWorking: false },
    { id: 6, code: 'VL', description: 'Vacation Leave', chargeableTo: 'VL', withPay: false, noBalance: false, requiredAdvancedFiling: false, exemptedFromAllowanceDeduction: false, legal: false, special: false, special2: false, doubleLegal: false, nonWorking: false },
    { id: 7, code: 'WN', description: 'Leave with notice', chargeableTo: 'WN', withPay: false, noBalance: false, requiredAdvancedFiling: false, exemptedFromAllowanceDeduction: false, legal: false, special: false, special2: false, doubleLegal: false, nonWorking: false }
  ]);

  const itemsPerPage = 10;
  
  const filteredData = leaveTypes.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.chargeableTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateNew = () => {
    setFormData({
      code: '',
      description: '',
      chargeableTo: '',
      withPay: false,
      noBalance: false,
      requiredAdvancedFiling: false,
      exemptedFromAllowanceDeduction: false,
      legal: false,
      special: false,
      special2: false,
      doubleLegal: false,
      nonWorking: false
    });
    setChargeableToSearch('');
    setShowCreateModal(true);
  };

  const handleEdit = (item: LeaveType) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      description: item.description,
      chargeableTo: item.chargeableTo,
      withPay: item.withPay,
      noBalance: item.noBalance,
      requiredAdvancedFiling: item.requiredAdvancedFiling,
      exemptedFromAllowanceDeduction: item.exemptedFromAllowanceDeduction,
      legal: item.legal,
      special: item.special,
      special2: item.special2,
      doubleLegal: item.doubleLegal,
      nonWorking: item.nonWorking
    });
    setChargeableToSearch('');
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this leave type?')) {
      setLeaveTypes(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: LeaveType = {
      id: Math.max(...leaveTypes.map(d => d.id), 0) + 1,
      code: formData.code,
      description: formData.description,
      chargeableTo: formData.chargeableTo,
      withPay: formData.withPay,
      noBalance: formData.noBalance,
      requiredAdvancedFiling: formData.requiredAdvancedFiling,
      exemptedFromAllowanceDeduction: formData.exemptedFromAllowanceDeduction,
      legal: formData.legal,
      special: formData.special,
      special2: formData.special2,
      doubleLegal: formData.doubleLegal,
      nonWorking: formData.nonWorking
    };
    setLeaveTypes(prev => [...prev, newItem]);
    setShowCreateModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setLeaveTypes(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                code: formData.code,
                description: formData.description,
                chargeableTo: formData.chargeableTo,
                withPay: formData.withPay,
                noBalance: formData.noBalance,
                requiredAdvancedFiling: formData.requiredAdvancedFiling,
                exemptedFromAllowanceDeduction: formData.exemptedFromAllowanceDeduction,
                legal: formData.legal,
                special: formData.special,
                special2: formData.special2,
                doubleLegal: formData.doubleLegal,
                nonWorking: formData.nonWorking
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

  const handleOpenSearchModal = () => {
    setSearchModalTerm('');
    setShowSearchModal(true);
  };

  const handleSelectLeaveType = (code: string) => {
    setFormData({ ...formData, chargeableTo: code });
    setShowSearchModal(false);
    setSearchModalTerm('');
  };

  // Filter leave types for search modal
  const filteredSearchData = leaveTypes.filter(item =>
    item.code.toLowerCase().includes(searchModalTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchModalTerm.toLowerCase())
  );

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close search modal first if it's open
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showEditModal) {
          setShowEditModal(false);
          setEditingItem(null);
        }
      }
    };

    if (showSearchModal || showCreateModal || showEditModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSearchModal, showCreateModal, showEditModal]);

  return (
      <div className="min-h-screen bg-white flex flex-col">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-slate-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-white-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-[1600px] mx-auto relative">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Leave Type Setup</h1>
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
                    Define and configure different types of employee leaves including vacation, sick leave, emergency leave, and other leave categories with specific rules and earning code mappings.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Multiple leave type categories</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Earning code integration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Flexible leave policies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Comprehensive leave management</span>
                    </div>
                  </div>
                </div>
              </div>
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Code</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Description</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">Chargeable To</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">With Pay</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">No Balance</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Required Advanced Filing</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Exempted From Allowance Deduction</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Legal</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Special</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Special 2</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Double Legal</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Non-Working</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-900">{item.code}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.description}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{item.chargeableTo}</td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.withPay} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.noBalance} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.requiredAdvancedFiling} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.exemptedFromAllowanceDeduction} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.legal} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.special} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.special2} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.doubleLegal} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" checked={item.nonWorking} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                        </td>
                        <td className="px-4 py-4">
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
                      <td colSpan={13} className="px-6 py-16 text-center">
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
              <h3 className="text-blue-600 mb-4">Leave Type Setup</h3>
              
              <div className="space-y-4">
                {/* Code */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-2 flex-shrink-0">
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
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-2 flex-shrink-0">
                    Description :
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Chargeable To */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-2 flex-shrink-0">
                    Chargeable To :
                  </label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.chargeableTo}
                      onChange={(e) => setFormData({ ...formData, chargeableTo: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleOpenSearchModal}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, chargeableTo: '' })}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* With Pay */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    With Pay :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.withPay}
                    onChange={(e) => setFormData({ ...formData, withPay: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* No Balance */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    No Balance :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.noBalance}
                    onChange={(e) => setFormData({ ...formData, noBalance: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Required Advanced Filing */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Required Advanced Filing :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.requiredAdvancedFiling}
                    onChange={(e) => setFormData({ ...formData, requiredAdvancedFiling: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Exempted From Allowance Deduction */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Exempted From Allowance Deduction :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.exemptedFromAllowanceDeduction}
                    onChange={(e) => setFormData({ ...formData, exemptedFromAllowanceDeduction: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Legal Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Legal Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.legal}
                    onChange={(e) => setFormData({ ...formData, legal: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Special Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Special Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.special}
                    onChange={(e) => setFormData({ ...formData, special: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Special Holiday 2 Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Special Holiday 2 Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.special2}
                    onChange={(e) => setFormData({ ...formData, special2: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Double Legal Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Double Legal Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.doubleLegal}
                    onChange={(e) => setFormData({ ...formData, doubleLegal: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Non-Working Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Non-Working Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.nonWorking}
                    onChange={(e) => setFormData({ ...formData, nonWorking: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
              <h2 className="text-gray-900">Edit Leave Type</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <h3 className="text-blue-600 mb-4">Leave Type Setup</h3>
              
              <div className="space-y-4">
                {/* Code */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-2 flex-shrink-0">
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
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-2 flex-shrink-0">
                    Description :
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Chargeable To */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-2 flex-shrink-0">
                    Chargeable To :
                  </label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.chargeableTo}
                      onChange={(e) => setFormData({ ...formData, chargeableTo: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleOpenSearchModal}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, chargeableTo: '' })}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* With Pay */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    With Pay :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.withPay}
                    onChange={(e) => setFormData({ ...formData, withPay: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* No Balance */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    No Balance :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.noBalance}
                    onChange={(e) => setFormData({ ...formData, noBalance: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Required Advanced Filing */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Required Advanced Filing :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.requiredAdvancedFiling}
                    onChange={(e) => setFormData({ ...formData, requiredAdvancedFiling: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Exempted From Allowance Deduction */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Exempted From Allowance Deduction :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.exemptedFromAllowanceDeduction}
                    onChange={(e) => setFormData({ ...formData, exemptedFromAllowanceDeduction: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Legal Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Legal Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.legal}
                    onChange={(e) => setFormData({ ...formData, legal: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Special Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Special Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.special}
                    onChange={(e) => setFormData({ ...formData, special: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Special Holiday 2 Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Special Holiday 2 Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.special2}
                    onChange={(e) => setFormData({ ...formData, special2: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Double Legal Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Double Legal Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.doubleLegal}
                    onChange={(e) => setFormData({ ...formData, doubleLegal: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {/* Non-Working Holiday Filed As Leave */}
                <div className="flex items-start gap-3">
                  <label className="text-gray-900 text-sm w-60 pt-1 flex-shrink-0">
                    Non-Working Holiday Filed As Leave :
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.nonWorking}
                    onChange={(e) => setFormData({ ...formData, nonWorking: e.target.checked })}
                    className="w-4 h-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[110vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
              <h2 className="text-gray-900">Search</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="space-y-4">
                {/* Blue Heading */}
                <h3 className="text-blue-600">Leave Type</h3>

                {/* Search Input */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-900 text-sm whitespace-nowrap">
                    Search:
                  </label>
                  <input
                    type="text"
                    value={searchModalTerm}
                    onChange={(e) => setSearchModalTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder=""
                    autoFocus
                  />
                </div>

                {/* Search Results Table - Simplified */}
                <div className="bg-white border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm text-gray-900">Code</th>
                        <th className="px-4 py-2 text-left text-sm text-gray-900">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSearchData.length > 0 ? (
                        filteredSearchData.map((item) => (
                          <tr 
                            key={item.id} 
                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                            onClick={() => handleSelectLeaveType(item.code)}
                          >
                            <td className="px-4 py-3 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-12 text-center">
                            <div className="text-gray-500">No data available</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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