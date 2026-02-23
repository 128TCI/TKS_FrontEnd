import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Edit, Trash2 } from 'lucide-react';

import { Footer } from '../../../Footer/Footer';
import Swal from 'sweetalert2';
import apiClient from '../../../../services/apiClient';
import auditTrail from '../../../../services/auditTrail';
import { decryptData } from '../../../../services/encryptionService';

const formName ='SDK List SetUp';
interface SDKItem {
  id: number;
  ipAdd: string;
  port: string;
  machID: number;
  wDeviceCode: boolean;
  flagCode: string;
}

interface DTRFlag {
  id: number;
  flagCode: string;
  timeIn: string;
  timeOut: string;
  break1Out: string;
  break1In: string;
  break2Out: string;
  break2In: string;
  break3Out: string;
  break3In: string;
}

export function SDKListSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<SDKItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Flag Code search modal states
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagSearchTerm, setFlagSearchTerm] = useState('');
  const [dtrFlags, setDTRFlags] = useState<DTRFlag[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(false);

  const [formData, setFormData] = useState({
    ipAdd: '',
    port: '',
    machID: 0,
    wDeviceCode: false,
    flagCode: ''
  });

  // SDK List states
  const [sdkItems, setSDKItems] = useState<SDKItem[]>([]);
  const [loadingSDK, setLoadingSDK] = useState(false);
  const [sdkError, setSDKError] = useState('');

  const itemsPerPage = 10;

  // Permissions
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const hasPermission = (accessType: string) => permissions[accessType] === true;
  
    useEffect(() => {
      getSDKListSetupPermissions();
    }, []);
  
    const getSDKListSetupPermissions = () => {
      const rawPayload = localStorage.getItem("loginPayload");
      if (!rawPayload) return;
  
      try {
        const parsedPayload = JSON.parse(rawPayload);
        const encryptedArray: any[] = parsedPayload.permissions || [];
  
        const branchEntries = encryptedArray.filter(
          (p) => decryptData(p.formName) === "SDKListSetup"
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

  useEffect(() => {
    fetchSDKList();
  }, []);

  const fetchSDKList = async () => {
    setLoadingSDK(true);
    setSDKError('');
    try {
      const response = await apiClient.get('/Fs/Process/Device/SDKListSetUp');
      if (response.status === 200 && response.data) {
        setSDKItems(response.data);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load SDK list';
      setSDKError(errorMsg);
      console.error('Error fetching SDK list:', error);
    } finally {
      setLoadingSDK(false);
    }
  };

  const fetchDTRFlags = async () => {
    setLoadingFlags(true);
    try {
      const response = await apiClient.get('/Fs/Process/Device/DTRFlagSetUp');
      if (response.status === 200 && response.data) {
        setDTRFlags(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching DTR flags:', error);
    } finally {
      setLoadingFlags(false);
    }
  };

  const handleOpenFlagModal = () => {
    setFlagSearchTerm('');
    fetchDTRFlags();
    setShowFlagModal(true);
  };

  const filteredData = sdkItems.filter(item =>
    item.ipAdd.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.port.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.machID.toString().includes(searchTerm) ||
    item.flagCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreateNew = () => {
    setFormData({ ipAdd: '', port: '', machID: 0, wDeviceCode: false, flagCode: '' });
    setShowCreateModal(true);
  };

  const handleEdit = (item: SDKItem) => {
    setEditingItem(item);
    setFormData({
      ipAdd: item.ipAdd,
      port: item.port,
      machID: item.machID,
      wDeviceCode: item.wDeviceCode,
      flagCode: item.flagCode
    });
    setShowEditModal(true);
  };

  const handleDelete = async (item: SDKItem) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete SDK item "${item.ipAdd}"?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/Device/SDKListSetUp/${item.id}`);
        await auditTrail.log({
          accessType: 'Delete',
          trans: `Deleted SDK item "${item.ipAdd}"`,
          messages: `SDK item "${item.ipAdd}" removed`,
          formName
        });
        await Swal.fire({ icon: 'success', title: 'Success', text: 'SDK item deleted successfully.', timer: 2000, showConfirmButton: false });
        await fetchSDKList();
      } catch (error: any) {
        await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'Failed to delete SDK item' });
      }
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ipAdd.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'IP Address is required.' });
      return;
    }
    if (sdkItems.some(item => item.ipAdd.toLowerCase() === formData.ipAdd.trim().toLowerCase())) {
      await Swal.fire({ icon: 'error', title: 'Duplicate IP Address', text: 'This IP address is already in use.' });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/Fs/Process/Device/SDKListSetUp', { id: 0, ...formData });
      await auditTrail.log({
        accessType: 'Add',
        trans: `Created SDK item "${formData.ipAdd}"`,
        messages: `SDK item "${formData.ipAdd}" created`,
        formName
      });
      await Swal.fire({ icon: 'success', title: 'Success', text: 'SDK item created successfully.', timer: 2000, showConfirmButton: false });
      await fetchSDKList();
      setShowCreateModal(false);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formData.ipAdd.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'IP Address is required.' });
      return;
    }
    if (sdkItems.some(item => item.id !== editingItem.id && item.ipAdd.toLowerCase() === formData.ipAdd.trim().toLowerCase())) {
      await Swal.fire({ icon: 'error', title: 'Duplicate IP Address', text: 'This IP address is already in use.' });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.put(`/Fs/Process/Device/SDKListSetUp/${editingItem.id}`, { id: editingItem.id, ...formData });
      await auditTrail.log({
        accessType: 'Edit',
        trans: `Updated SDK item "${formData.ipAdd}" (ID: ${editingItem.id})`,
        messages: `SDK item "${formData.ipAdd}" updated`,
        formName
      });
      await Swal.fire({ icon: 'success', title: 'Success', text: 'SDK item updated successfully.', timer: 2000, showConfirmButton: false });
      await fetchSDKList();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error: any) {
      await Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || error.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    setShowFlagModal(false);
  };

  // ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showFlagModal) { setShowFlagModal(false); }
        else if (showCreateModal) { setShowCreateModal(false); }
        else if (showEditModal) { setShowEditModal(false); setEditingItem(null); }
      }
    };
    if (showCreateModal || showEditModal || showFlagModal) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => { document.removeEventListener('keydown', handleEscKey); };
  }, [showCreateModal, showEditModal, showFlagModal]);

  // ─── Reusable Create / Edit modal (flag search modal is nested inside) ───
  const renderModalForm = (isEdit: boolean, onSubmit: (e: React.FormEvent) => void) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0 z-[1]">
          <h2 className="text-gray-900">{isEdit ? 'Edit SDK Item' : 'Create New'}</h2>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Form body ── */}
        <form onSubmit={onSubmit} className="p-6">
          <h3 className="text-blue-600 mb-4">SDK List Setup</h3>
          <div className="space-y-3">
            {/* IP Address */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 text-sm whitespace-nowrap w-40">IP Address :</label>
              <input type="text" value={formData.ipAdd} onChange={(e) => setFormData({ ...formData, ipAdd: e.target.value })} placeholder="e.g. 192.168.1.100" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            {/* Port */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 text-sm whitespace-nowrap w-40">Port :</label>
              <input type="text" value={formData.port} onChange={(e) => setFormData({ ...formData, port: e.target.value })} placeholder="e.g. 4370" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            {/* Machine ID */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 text-sm whitespace-nowrap w-40">Machine ID :</label>
              <input type="number" value={formData.machID} onChange={(e) => setFormData({ ...formData, machID: parseInt(e.target.value) || 0 })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
            {/* With Device Code */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 text-sm whitespace-nowrap w-40">With Device Code :</label>
              <input type="checkbox" checked={formData.wDeviceCode} onChange={(e) => setFormData({ ...formData, wDeviceCode: e.target.checked })} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" />
              <span className="text-gray-500 text-sm">{formData.wDeviceCode ? 'Yes' : 'No'}</span>
            </div>
            {/* Flag Code – read-only + Search button */}
            <div className="flex items-center gap-3">
              <label className="text-gray-700 text-sm whitespace-nowrap w-40">Flag Code :</label>
              <input type="text" value={formData.flagCode} readOnly placeholder="Select flag code..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={handleOpenFlagModal} className="w-10 h-10 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, flagCode: '' })}
                className="w-10 h-10 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit / Back */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm">
              {submitting ? (isEdit ? 'Updating...' : 'Submitting...') : (isEdit ? 'Update' : 'Submit')}
            </button>
            <button type="button" onClick={handleCloseModal} disabled={submitting} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm">
              Back to List
            </button>
          </div>
        </form>

        {/* ── Flag Code Search Modal (AMS-style with full details) ── */}
        {showFlagModal && (
          <div className="absolute inset-0 bg-transparent flex items-center justify-center z-[10] rounded-lg p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg sticky top-0">
                <h2 className="text-gray-900">Search</h2>
                <button
                  type="button"
                  onClick={() => setShowFlagModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-blue-600 mb-4">DTR Flag</h3>

                {/* Search */}
                <div className="flex items-center justify-end gap-2 mb-4">
                  <label className="text-gray-700 text-sm">Search:</label>
                  <input
                    type="text"
                    autoFocus
                    value={flagSearchTerm}
                    onChange={(e) => setFlagSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  />
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  {loadingFlags ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-gray-600 text-sm">Loading flag codes...</div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Flag Code</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Time In</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Time Out</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break1 Out</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break1 In</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break2 Out</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break2 In</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break3 Out</th>
                          <th className="px-4 py-3 text-left text-xs text-gray-600 uppercase">Break3 In</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(() => {
                          const filtered = dtrFlags.filter(f => 
                            f.flagCode.toLowerCase().includes(flagSearchTerm.toLowerCase())
                          );
                          return filtered.length > 0 ? (
                            filtered.map((flag) => (
                              <tr
                                key={flag.id}
                                className="hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, flagCode: flag.flagCode }));
                                  setShowFlagModal(false);
                                }}
                              >
                                <td className="px-4 py-3 text-sm text-blue-600 hover:underline">{flag.flagCode}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.timeIn}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.timeOut}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break1Out}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break1In}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break2Out}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break2In}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break3Out}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{flag.break3In}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                No flag codes available
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ── end Flag Code Search Modal ── */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">SDK List Setup</h1>
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
                    Manage SDK (Software Development Kit) configurations for biometric device integration. Register SDK libraries and connection parameters for direct device communication and data retrieval.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Real-time device connection','SDK library management','Direct data access','Device registration'].map(t => (
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
              {(hasPermission('Add') && hasPermission('View')) && (
                <button onClick={handleCreateNew} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Create New
                </button>
              )}
              {hasPermission('View') && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 text-sm">Search:</label>
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64" />
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {loadingSDK ? (
                <div className="flex items-center justify-center py-8"><div className="text-gray-600 text-sm">Loading SDK list...</div></div>
              ) : sdkError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded"><p className="text-red-700 text-sm">{sdkError}</p></div>
              ) : hasPermission('View') ? (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Port</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Machine ID</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">With Device Code</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Flag Code</th>
                      {(hasPermission('Edit') || hasPermission('Delete')) && (
                        <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? paginatedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.ipAdd}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.port}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.machID}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.wDeviceCode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {item.wDeviceCode ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.flagCode}</td>
                        {(hasPermission('Edit') || hasPermission('Delete')) && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {hasPermission('Edit') && (
                              <button 
                                onClick={() => handleEdit(item)} 
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                                title="Edit"><Edit 
                              className="w-4 h-4" />
                              </button>
                            )}
                            {hasPermission("Edit") && hasPermission("Delete") && (
                                <span className="text-gray-300">|</span>
                            )}
                            {hasPermission('Delete') && (
                              <button 
                                onClick={() => handleDelete(item)} 
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" 
                                title="Delete"><Trash2 
                                className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>)}
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="px-6 py-16 text-center"><div className="text-gray-500">No data available in table</div></td></tr>
                    )}
                  </tbody>
                </table> ) : (
                  <div className="text-center py-10 text-gray-500">
                      You do not have permission to view this list.
                  </div>
              )}
            </div>

            {/* Pagination */}
            {hasPermission('View') && (
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
            </div>)}
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