import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../Footer/Footer';
import apiClient from '../../../services/apiClient';
import Swal from 'sweetalert2';
import { decryptData } from '../../../services/encryptionService';
import auditTrail from '../../../services/auditTrail';

const API_BASE = '/Fs/Process/LeaveTypeSetUp';
const formName = 'Leave Type Setup';

interface LeaveType {
  leaveID: number;
  leaveCode: string;
  leaveDesc: string;
  chargeableTo: string;
  withPay: string;
  subTypeRequired: boolean;
  basedOnTenure: boolean;
  withDateDuration: boolean;
  noBalance: boolean;
  legalFileAsLeave: boolean;
  sphFileAsLeave: boolean;
  dbleLegalFileAsLeave: boolean;
  sph2FileAsLeave: boolean;
  prevYrLvCode: string;
  nwhFileAsLeave: boolean;
  requiredAdvanceFiling: boolean;
  exemptFromAllowDeduction: boolean;
}

const defaultForm: Omit<LeaveType, 'leaveID'> = {
  leaveCode: '',
  leaveDesc: '',
  chargeableTo: '',
  withPay: '',
  subTypeRequired: false,
  basedOnTenure: false,
  withDateDuration: false,
  noBalance: false,
  legalFileAsLeave: false,
  sphFileAsLeave: false,
  dbleLegalFileAsLeave: false,
  sph2FileAsLeave: false,
  prevYrLvCode: '',
  nwhFileAsLeave: false,
  requiredAdvanceFiling: false,
  exemptFromAllowDeduction: false,
};

export function LeaveTypeSetupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalTerm, setSearchModalTerm] = useState('');

  const [formData, setFormData] = useState<Omit<LeaveType, 'leaveID'>>(defaultForm);
  const [editingItem, setEditingItem] = useState<LeaveType | null>(null);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) => permissions[accessType] === true;

  useEffect(() => { getLeaveTypeSetupPermissions(); }, []);

  const getLeaveTypeSetupPermissions = () => {
    const rawPayload = localStorage.getItem('loginPayload');
    if (!rawPayload) return;
    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];
      const entries = encryptedArray.filter((p) => decryptData(p.formName) === 'LeaveTypeSetUp');
      const permMap: Record<string, boolean> = {};
      entries.forEach((p) => {
        const accessType = decryptData(p.accessTypeName);
        if (accessType) permMap[accessType] = true;
      });
      setPermissions(permMap);
    } catch (e) {
      console.error('Error parsing or decrypting payload', e);
    }
  };

  useEffect(() => { fetchLeaveTypes(); }, []);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(API_BASE);
      if (response.status === 200 && response.data) setLeaveTypes(response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load leave types';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (showSearchModal) setShowSearchModal(false);
      else if (showCreateModal) setShowCreateModal(false);
      else if (showEditModal) { setShowEditModal(false); setEditingItem(null); }
    };
    if (showSearchModal || showCreateModal || showEditModal)
      document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showSearchModal, showCreateModal, showEditModal]);

  const filteredData = leaveTypes.filter((item) =>
    item.leaveCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.leaveDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.chargeableTo ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const filteredSearchData = leaveTypes.filter((item) =>
    item.leaveCode.toLowerCase().includes(searchModalTerm.toLowerCase()) ||
    item.leaveDesc.toLowerCase().includes(searchModalTerm.toLowerCase())
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleCreateNew = () => { setFormData(defaultForm); setShowCreateModal(true); };

  const handleEdit = (item: LeaveType) => {
    setEditingItem(item);
    setFormData({
      leaveCode: item.leaveCode, leaveDesc: item.leaveDesc, chargeableTo: item.chargeableTo,
      withPay: item.withPay, subTypeRequired: item.subTypeRequired, basedOnTenure: item.basedOnTenure,
      withDateDuration: item.withDateDuration, noBalance: item.noBalance,
      legalFileAsLeave: item.legalFileAsLeave, sphFileAsLeave: item.sphFileAsLeave,
      dbleLegalFileAsLeave: item.dbleLegalFileAsLeave, sph2FileAsLeave: item.sph2FileAsLeave,
      prevYrLvCode: item.prevYrLvCode, nwhFileAsLeave: item.nwhFileAsLeave,
      requiredAdvanceFiling: item.requiredAdvanceFiling, exemptFromAllowDeduction: item.exemptFromAllowDeduction,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (item: LeaveType) => {
    const confirmed = await Swal.fire({
      icon: 'warning', title: 'Confirm Delete',
      text: `Are you sure you want to delete leave type "${item.leaveDesc}"?`,
      showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
    });
    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`${API_BASE}/${item.leaveID}`);
        await auditTrail.log({ accessType: 'Delete', trans: `Deleted leave type "${item.leaveDesc}"`, messages: `Leave type "${item.leaveDesc}" removed`, formName });
        await Swal.fire({ icon: 'success', title: 'Success', text: 'Leave type deleted successfully.', timer: 2000, showConfirmButton: false });
        await fetchLeaveTypes();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete';
        await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
      }
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaveCode) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter a code.' });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post(API_BASE, { leaveID: 0, ...formData });
      await auditTrail.log({ accessType: 'Add', trans: `Created leave type "${formData.leaveDesc}"`, messages: `Leave type "${formData.leaveDesc}" created`, formName });
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Leave type created successfully.', timer: 2000, showConfirmButton: false });
      await fetchLeaveTypes();
      setShowCreateModal(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formData.leaveCode) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please enter a code.' });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.put(`${API_BASE}/${editingItem.leaveID}`, { leaveID: editingItem.leaveID, ...formData });
      await auditTrail.log({ accessType: 'Edit', trans: `Updated leave type "${formData.leaveDesc}"`, messages: `Leave type "${formData.leaveDesc}" updated`, formName });
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Leave type updated successfully.', timer: 2000, showConfirmButton: false });
      await fetchLeaveTypes();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false); setShowEditModal(false);
    setEditingItem(null); setShowSearchModal(false);
  };

  const handleOpenSearchModal = () => { setSearchModalTerm(''); setShowSearchModal(true); };

  const handleSelectLeaveType = (code: string) => {
    setFormData((prev) => ({ ...prev, chargeableTo: code }));
    setShowSearchModal(false); setSearchModalTerm('');
  };

  // ── Chargeable-To Search Modal ─────────────────────────────────────────────
  const renderSearchModal = () => (
    <>
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-transparent flex items-center justify-center z-[100] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearchModal(false); }}
        >
<div className="bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto" style={{ width: '600px' }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-gray-900 font-semibold text-sm">Search</h2>
              <button type="button" onClick={() => setShowSearchModal(false)} className="text-gray-600 hover:text-gray-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-blue-600 mb-3 font-semibold text-sm">Leave Type</h3>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-gray-900 text-xs whitespace-nowrap">Search:</label>
                <input
                  type="text"
                  value={searchModalTerm}
                  onChange={(e) => setSearchModalTerm(e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>
              <div className="border border-gray-200 rounded overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-gray-700">Code</th>
                      <th className="px-3 py-2 text-left text-xs text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSearchData.length > 0 ? (
                      filteredSearchData.map((item) => (
                        <tr key={item.leaveID} className="hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => handleSelectLeaveType(item.leaveCode)}>
                          <td className="px-3 py-2 text-sm text-gray-900">{item.leaveCode}</td>
                          <td className="px-3 py-2 text-sm text-gray-600">{item.leaveDesc}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500 text-sm">No data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── form fields (compact) ──────────────────────────────────────────────────
  type BooleanKeys = {
    [K in keyof typeof defaultForm]: (typeof defaultForm)[K] extends boolean ? K : never;
  }[keyof typeof defaultForm];

  const checkbox = (key: BooleanKeys, label: string) => (
    <div className="flex items-center gap-3">
      <label className="text-gray-700 text-sm w-56 flex-shrink-0">{label} :</label>
      <input
        type="checkbox"
        checked={formData[key] as boolean}
        onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.checked }))}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </div>
  );

  const renderFormFields = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-gray-700 text-sm w-56 flex-shrink-0">Code :</label>
        <input type="text" value={formData.leaveCode}
          onChange={(e) => setFormData((p) => ({ ...p, leaveCode: e.target.value }))}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-gray-700 text-sm w-56 flex-shrink-0">Description :</label>
        <input type="text" value={formData.leaveDesc}
          onChange={(e) => setFormData((p) => ({ ...p, leaveDesc: e.target.value }))}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-gray-700 text-sm w-56 flex-shrink-0">Chargeable To :</label>
        <div className="flex-1 flex items-center gap-2">
          <input type="text" value={formData.chargeableTo}
            onChange={(e) => setFormData((p) => ({ ...p, chargeableTo: e.target.value }))}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Code" />
          <button type="button" onClick={handleOpenSearchModal} className="px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setFormData((p) => ({ ...p, chargeableTo: '' }))} className="px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-gray-700 text-sm w-56 flex-shrink-0">With Pay :</label>
        <input type="text" value={formData.withPay}
          onChange={(e) => setFormData((p) => ({ ...p, withPay: e.target.value }))}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Y / N" />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-gray-700 text-sm w-56 flex-shrink-0">Previous Year Leave Code :</label>
        <input type="text" value={formData.prevYrLvCode}
          onChange={(e) => setFormData((p) => ({ ...p, prevYrLvCode: e.target.value }))}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      {checkbox('subTypeRequired', 'Sub-Type Required')}
      {checkbox('basedOnTenure', 'Based on Tenure')}
      {checkbox('withDateDuration', 'With Date Duration')}
      {checkbox('noBalance', 'No Balance')}
      {checkbox('requiredAdvanceFiling', 'Required Advanced Filing')}
      {checkbox('exemptFromAllowDeduction', 'Exempted From Allowance Deduction')}
      {checkbox('legalFileAsLeave', 'Legal Holiday Filed As Leave')}
      {checkbox('sphFileAsLeave', 'Special Holiday Filed As Leave')}
      {checkbox('sph2FileAsLeave', 'Special Holiday 2 Filed As Leave')}
      {checkbox('dbleLegalFileAsLeave', 'Double Legal Holiday Filed As Leave')}
      {checkbox('nwhFileAsLeave', 'Non-Working Holiday Filed As Leave')}
    </div>
  );

  // ── shared modal shell ─────────────────────────────────────────────────────
  const ModalShell = ({ title, onSubmit, submitLabel, children }: {
    title: string; onSubmit: (e: React.FormEvent) => void;
    submitLabel: string; children?: React.ReactNode;
  }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
     <div className="bg-white rounded-xl shadow-2xl max-h-[100vh] overflow-y-auto" style={{ width: '600px' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl sticky top-0 z-10">
          <h2 className="text-gray-900 font-semibold text-sm">{title}</h2>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5">
          <h3 className="text-blue-600 mb-3 font-semibold text-sm">Leave Type Setup</h3>
          {renderFormFields()}
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-200">
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Saving...' : submitLabel}
            </button>
            <button type="button" onClick={handleCloseModal} disabled={submitting}
              className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Back to List
            </button>
          </div>
        </form>
      </div>
      {children}
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-slate-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-white-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-slate-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Leave Type Setup</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6">
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
                    Define and configure different types of employee leaves including vacation, sick leave, emergency leave, and other leave categories.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Multiple leave type categories', 'Earning code integration', 'Flexible leave policies', 'Comprehensive leave management'].map((t) => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Controls */}
            {hasPermission('View') && (
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                {hasPermission('Add') && (
                  <button onClick={handleCreateNew}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 text-sm">Search:</label>
                  <input type="text" value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64" />
                </div>
              </div>
            )}

            {/* Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-600 text-sm">Loading leave types...</div>
              </div>
            ) : hasPermission('View') ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      {['Code','Description','Chargeable To','With Pay','No Balance','Sub-Type Req.','Based on Tenure','Date Duration','Req. Adv. Filing','Exempt Allow. Ded.','Legal','Special','Special 2','Dbl Legal','Non-Working'].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-xs text-gray-600 uppercase whitespace-nowrap">{h}</th>
                      ))}
                      {(hasPermission('Edit') || hasPermission('Delete')) && (
                        <th className="px-3 py-3 text-center text-xs text-gray-600 uppercase whitespace-nowrap">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => {
                        const boolCell = (val: boolean) => (
                          <td className="px-3 py-4 text-center">
                            <input type="checkbox" checked={val} readOnly className="w-4 h-4 rounded border-gray-300 pointer-events-none" />
                          </td>
                        );
                        const chargeableMatch = leaveTypes.find((lt) => lt.leaveCode === item.chargeableTo);
                        const chargeableDisplay = chargeableMatch ? `${chargeableMatch.leaveCode} - ${chargeableMatch.leaveDesc}` : item.chargeableTo;
                        return (
                          <tr key={item.leaveID} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-4 text-sm text-gray-900">{item.leaveCode}</td>
                            <td className="px-3 py-4 text-sm text-gray-600">{item.leaveDesc}</td>
                            <td className="px-3 py-4 text-sm text-gray-600">{chargeableDisplay}</td>
                            <td className="px-3 py-4 text-sm text-gray-600">{item.withPay}</td>
                            {boolCell(item.noBalance)}
                            {boolCell(item.subTypeRequired)}
                            {boolCell(item.basedOnTenure)}
                            {boolCell(item.withDateDuration)}
                            {boolCell(item.requiredAdvanceFiling)}
                            {boolCell(item.exemptFromAllowDeduction)}
                            {boolCell(item.legalFileAsLeave)}
                            {boolCell(item.sphFileAsLeave)}
                            {boolCell(item.sph2FileAsLeave)}
                            {boolCell(item.dbleLegalFileAsLeave)}
                            {boolCell(item.nwhFileAsLeave)}
                            {(hasPermission('Edit') || hasPermission('Delete')) && (
                              <td className="px-3 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  {hasPermission('Edit') && (
                                    <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" title="Edit">
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                  {hasPermission('Edit') && hasPermission('Delete') && <span className="text-gray-300">|</span>}
                                  {hasPermission('Delete') && (
                                    <button onClick={() => handleDelete(item)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={16} className="px-6 py-16 text-center text-gray-500">No data available in table</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">You do not have permission to view this list.</div>
            )}

            {/* Pagination */}
            {hasPermission('View') && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-gray-100'}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages || filteredData.length === 0}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Modal ──────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <ModalShell title="Create New" onSubmit={handleSubmitCreate} submitLabel="Submit">
          {renderSearchModal()}
        </ModalShell>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────────── */}
      {showEditModal && editingItem && (
        <ModalShell title="Edit Leave Type" onSubmit={handleSubmitEdit} submitLabel="Update">
          {renderSearchModal()}
        </ModalShell>
      )}

      <Footer />

      <style>{`
        @keyframes blob {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(30px,-50px) scale(1.1); }
          66%  { transform: translate(-20px,20px) scale(0.9); }
          100% { transform: translate(0,0) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}