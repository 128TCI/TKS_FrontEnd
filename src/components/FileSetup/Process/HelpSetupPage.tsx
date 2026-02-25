import { useState, useEffect } from 'react';
import { Plus, X, Check, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import Swal from 'sweetalert2';
import apiClient from '../../../services/apiClient';

interface HelpItem {
  id: number;
  code: string;
  description: string;
  fileName: string;
  file: string;
}

// Grab the uploadedBaseURL from the axios instance config
const UPLOADED_BASE_URL = (apiClient.defaults as any).uploadedBaseURL || 'https://localhost:7264/uploaded/HelpSetUp';

export function HelpSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<HelpItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    fileName: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Help items list states
  const [helpItems, setHelpItems] = useState<HelpItem[]>([]);
  const [loadingHelp, setLoadingHelp] = useState(false);
  const [helpError, setHelpError] = useState('');

  const itemsPerPage = 10;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchHelpItems();
  }, []);

  const fetchHelpItems = async () => {
    setLoadingHelp(true);
    setHelpError('');
    try {
      const response = await apiClient.get('/Fs/Process/HelpSetUp');
      if (response.status === 200 && response.data) {
        setHelpItems(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load help items';
      setHelpError(errorMsg);
      console.error('Error fetching help items:', error);
    } finally {
      setLoadingHelp(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getFileUrl = (fileName: string) => `${UPLOADED_BASE_URL}/${fileName}`;

  const openFile = (fileName: string) => {
    if (fileName) {
      window.open(getFileUrl(fileName), '_blank', 'noopener,noreferrer');
    }
  };

  // ── Filter / paginate ─────────────────────────────────────────────────────
  const filteredData = helpItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ── Modal openers ─────────────────────────────────────────────────────────
  const handleCreateNew = () => {
    setFormData({ code: '', description: '', fileName: '' });
    setSelectedFile(null);
    setShowCreateModal(true);
  };

  const handleEdit = (item: HelpItem) => {
    setEditingItem(item);
    setFormData({ code: item.code, description: item.description, fileName: item.fileName });
    setSelectedFile(null);
    setShowEditModal(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (item: HelpItem) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete help item "${item.code}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/HelpSetUp/${item.id}`);
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Help item deleted successfully.', timer: 2000, showConfirmButton: false });
        await fetchHelpItems();
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete help item' });
      }
    }
  };

  // ── File input ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, fileName: file.name }));
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Code is required.' });
      return;
    }

    if (helpItems.some(item => item.code.toLowerCase() === formData.code.trim().toLowerCase())) {
      await Swal.fire({ icon: 'error', title: 'Duplicate Code', text: 'This code is already in use. Please use a different one.' });
      return;
    }

    setSubmitting(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('id', '0');
      formDataPayload.append('code', formData.code);
      formDataPayload.append('description', formData.description);
      formDataPayload.append('fileName', formData.fileName);
      if (selectedFile) {
        formDataPayload.append('file', selectedFile);
      }

      await apiClient.post('/Fs/Process/HelpSetUp', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await Swal.fire({ icon: 'success', title: 'Success', text: 'Help item created successfully.', timer: 2000, showConfirmButton: false });
      await fetchHelpItems();
      setShowCreateModal(false);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!formData.code.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Code is required.' });
      return;
    }

    if (helpItems.some(item => item.id !== editingItem.id && item.code.toLowerCase() === formData.code.trim().toLowerCase())) {
      await Swal.fire({ icon: 'error', title: 'Duplicate Code', text: 'This code is already in use. Please use a different one.' });
      return;
    }

    setSubmitting(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('id', String(editingItem.id));
      formDataPayload.append('code', formData.code);
      formDataPayload.append('description', formData.description);
      formDataPayload.append('fileName', formData.fileName);
      if (selectedFile) {
        formDataPayload.append('file', selectedFile);
      }

      await apiClient.put(`/Fs/Process/HelpSetUp/${editingItem.id}`, formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await Swal.fire({ icon: 'success', title: 'Success', text: 'Help item updated successfully.', timer: 2000, showConfirmButton: false });
      await fetchHelpItems();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Close ─────────────────────────────────────────────────────────────────
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    setSelectedFile(null);
  };

  // ── ESC key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal) setShowCreateModal(false);
        else if (showEditModal) { setShowEditModal(false); setEditingItem(null); }
      }
    };
    if (showCreateModal || showEditModal) document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showCreateModal, showEditModal]);

  // ── Shared modal renderer ─────────────────────────────────────────────────
  const renderModalForm = (isEdit: boolean, onSubmit: (e: React.FormEvent) => void) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-10">
          <h2 className="text-gray-900">{isEdit ? 'Edit Help Item' : 'Create New'}</h2>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-6">
          <h3 className="text-blue-600 mb-4">Help Setup</h3>

          <div className="space-y-3">
            {/* Code */}
            <div className="flex items-center gap-3">
              <label className="text-gray-900 text-sm whitespace-nowrap w-32">Code :</label>
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
              <label className="text-gray-900 text-sm whitespace-nowrap w-32">Description :</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* File upload row */}
            <div className="flex items-center gap-3">
              <label className="text-gray-900 text-sm whitespace-nowrap w-32">File Name :</label>
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                {/* hidden native input – unique id per mode */}
                <input
                  type="file"
                  onChange={handleFileChange}
                  id={isEdit ? 'file-upload-edit' : 'file-upload-create'}
                  className="hidden"
                />
                <label
                  htmlFor={isEdit ? 'file-upload-edit' : 'file-upload-create'}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer text-sm text-gray-700 transition-colors"
                >
                  Choose File
                </label>

                {/* display name */}
                <span className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : formData.fileName || 'No file chosen'}
                </span>

                {/* "View file" button – only when editing AND there is an existing fileName */}
                {isEdit && formData.fileName && (
                  <button
                    type="button"
                    onClick={() => openFile(formData.fileName)}
                    className="ml-2 px-3 py-1.5 bg-blue-50 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5 text-sm flex-shrink-0"
                    title={`Open: ${UPLOADED_BASE_URL}/${formData.fileName}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View File
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
            >
              {submitting ? (isEdit ? 'Updating...' : 'Submitting...') : (isEdit ? 'Update' : 'Submit')}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={submitting}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
            >
              Back to List
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Help Setup</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">
            {/* Info banner */}
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
                    {['Comprehensive help documentation','Custom topic organization','Detailed content management','User-friendly reference system'].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <button onClick={handleCreateNew} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Create New
              </button>
              <div className="flex items-center gap-2">
                <label className="text-gray-700 text-sm">Search:</label>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64" />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {loadingHelp ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading help items...</div>
                </div>
              ) : helpError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{helpError}</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">File</th>
                      <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                        <td className="px-6 py-4 text-sm">
                          {item.fileName ? (
                            <button
                              type="button"
                              onClick={() => openFile(item.fileName)}
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors"
                              title={`Open: ${UPLOADED_BASE_URL}/${item.fileName}`}
                            >
                              {item.fileName}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">No file</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="text-gray-500">No data available in table</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))} disabled={currentPage >= totalPages || filteredData.length === 0} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && renderModalForm(false, handleSubmitCreate)}

      {/* Edit Modal */}
      {showEditModal && editingItem && renderModalForm(true, handleSubmitEdit)}

      {/* Footer */}
      <Footer />
    </div>
  );
}