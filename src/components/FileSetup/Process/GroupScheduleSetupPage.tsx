import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import { decryptData } from '../../../services/encryptionService';


interface GroupSchedule {
  id: number;
  code: string;
  description: string;
}

export function GroupScheduleSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<GroupSchedule | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: ''
  });

  const [schedules, setSchedules] = useState<GroupSchedule[]>([
    { id: 1, code: 'a', description: 'a' },
    { id: 2, code: 'ab', description: 'ab' }
  ]);

  const itemsPerPage = 10;

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getGroupSchedSetupPermissions();
    }, []);
  
    const getGroupSchedSetupPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "GroupScheduleSetUp"
        );
  
        // Build a map: { Add: true, Edit: true, ... }
        const permMap: Record<string, boolean> = {};
        branchEntries.forEach((p) => {
          const accessType = decryptData(p.accessTypeName);
          if (accessType) permMap[accessType] = true;
        });
  
        setPermissions(permMap);
  
      } catch (e) {
        console.error("Error parsing or decrypting payload", e);
      }
    };
  
  const filteredData = schedules.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateNew = () => {
    setFormData({
      code: '',
      description: ''
    });
    setShowCreateModal(true);
  };

  const handleEdit = (item: GroupSchedule) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      description: item.description
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this group schedule?')) {
      setSchedules(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchedule: GroupSchedule = {
      id: Math.max(...schedules.map(d => d.id), 0) + 1,
      code: formData.code,
      description: formData.description
    };
    setSchedules(prev => [...prev, newSchedule]);
    setShowCreateModal(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setSchedules(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                code: formData.code,
                description: formData.description
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

    return (
     <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Group Schedule Setup</h1>
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
                    Create and manage help documentation, user guides, and reference materials for the timekeeping system to assist users with various features and functionalities.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Comprehensive help documentation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Custom topic organization</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Detailed content management</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">User-friendly reference system</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Controls */}
            {(hasPermission('Add') && hasPermission('View')) && (
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              {hasPermission('Add') && (
                <button
                  onClick={handleCreateNew}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>
              )}
              {hasPermission('View') && (
              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>)}
            </div>)}

            {/* Table */}
            {hasPermission('View') ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                    {(hasPermission('Edit') || hasPermission('Delete')) && (
                      <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                        {(hasPermission('Edit') || hasPermission('Delete')) && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {hasPermission('Edit') && (
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="Edit"
                              >
                                  <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission("Edit") && hasPermission("Delete") && (
                                <span className="text-gray-300">|</span>
                            )}
                            {hasPermission('Delete') && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Delete"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>)}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center">
                        <div className="text-gray-500">No data available in table</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>) : (
              <div className="text-center py-10 text-gray-500">
                  You do not have permission to view this list.
              </div>
            )}

            {/* Pagination */}
            {hasPermission('View') && (
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
            </div>)}
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
              <h3 className="text-blue-600 mb-4">Group Schedule Setup</h3>
              
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
              <h2 className="text-gray-900">Edit Group Schedule</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <h3 className="text-blue-600 mb-4">Group Schedule Setup</h3>
              
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