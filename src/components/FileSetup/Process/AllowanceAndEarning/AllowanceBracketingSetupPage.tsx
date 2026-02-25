import { useState, useEffect } from 'react';
import { Search, Plus, X, Check, Edit, Trash2 } from 'lucide-react';
import { Footer } from '../../../Footer/Footer';
import apiClient from '../../../../services/apiClient';
import Swal from 'sweetalert2';
import { decryptData } from '../../../../services/encryptionService';

interface AllowanceBracketing {
  id: string;
  dayType: string;
  noOfHrs: number;
  earningCode: string;
  amount: number;
  code: string;
  workShiftCode: string;
  byEmploymentStatFlag: boolean;
  employmentStatus: string;
}

interface EarningCode {
  id: string;
  code: string;
  description: string;
}

interface AllowanceBracketCode {
  id: number;
  code: string;
  description: string;
}

interface WorkshiftCode {
  id: number | string;
  code: string;
  description: string;
}

export function AllowanceBracketingSetupPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEarningCodeModal, setShowEarningCodeModal] = useState(false);
  const [showAllowanceBracketModal, setShowAllowanceBracketModal] = useState(false);
  const [showWorkshiftModal, setShowWorkshiftModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [earningCodeSearchTerm, setEarningCodeSearchTerm] = useState('');
  const [allowanceBracketCode, setAllowanceBracketCode] = useState('');
  const [workshiftCode, setWorkshiftCode] = useState('');
  const [dayType, setDayType] = useState('RegDay');
  const [includeWithinShift, setIncludeWithinShift] = useState(false);
  const [byEmploymentStatus, setByEmploymentStatus] = useState(false);
  const [formData, setFormData] = useState({ noOfHours: '', amount: '', earningCode: '' });
  const [editingItem, setEditingItem] = useState<AllowanceBracketing | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [bracketingData, setBracketingData] = useState<AllowanceBracketing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [earningCodes, setEarningCodes] = useState<EarningCode[]>([]);
  const [loadingEarnings, setLoadingEarnings] = useState(false);

  // Allowance Bracket Code modal state
  const [allowanceBracketCodes, setAllowanceBracketCodes] = useState<AllowanceBracketCode[]>([]);
  const [loadingAllowanceBracket, setLoadingAllowanceBracket] = useState(false);
  const [allowanceBracketSearchTerm, setAllowanceBracketSearchTerm] = useState('');
  const [allowanceBracketPage, setAllowanceBracketPage] = useState(1);

  // Workshift Code modal state
  const [workshiftCodes, setWorkshiftCodes] = useState<WorkshiftCode[]>([]);
  const [loadingWorkshift, setLoadingWorkshift] = useState(false);
  const [workshiftSearchTerm, setWorkshiftSearchTerm] = useState('');
  const [workshiftPage, setWorkshiftPage] = useState(1);

  const itemsPerPage = 100;
  const modalItemsPerPage = 10;

  // Permissions
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const hasPermission = (accessType: string) => permissions[accessType] === true;

  useEffect(() => {
    getAllowanceBracketingSetupPermissions();
  }, []);

  const getAllowanceBracketingSetupPermissions = () => {
    const rawPayload = localStorage.getItem("loginPayload");
    if (!rawPayload) return;

    try {
      const parsedPayload = JSON.parse(rawPayload);
      const encryptedArray: any[] = parsedPayload.permissions || [];

      const branchEntries = encryptedArray.filter(
        (p) => decryptData(p.formName) === "AllowBracketing"
      );

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
    fetchBracketingData();
    fetchEarningCodes();
  }, []);

  const fetchBracketingData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/AllowanceBracketingSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((item: any) => ({
          id: item.id?.toString() || '',
          dayType: item.dayType || '',
          noOfHrs: item.noOfHrs || 0,
          earningCode: item.earningCode || '',
          amount: item.amount || 0,
          code: item.code || '',
          workShiftCode: item.workShiftCode || '',
          byEmploymentStatFlag: item.byEmploymentStatFlag || false,
          employmentStatus: item.employmentStatus || '',
        }));
        setBracketingData(mappedData);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load allowance bracketing data';
      setError(errorMsg);
      console.error('Error fetching allowance bracketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningCodes = async () => {
    setLoadingEarnings(true);
    try {
      const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/EarningsSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((earning: any) => ({
          id: earning.earnID?.toString() || earning.id || '',
          code: earning.earnCode || earning.code || '',
          description: earning.earnDesc || earning.description || '',
        }));
        setEarningCodes(mappedData);
      }
    } catch (error: any) {
      console.error('Error fetching earning codes:', error);
    } finally {
      setLoadingEarnings(false);
    }
  };

  const fetchAllowanceBracketCodes = async () => {
    setLoadingAllowanceBracket(true);
    try {
      const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/AllowanceBracketCodeSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((item: any) => ({
          id: item.id || 0,
          code: item.code || '',
          description: item.description || '',
        }));
        setAllowanceBracketCodes(mappedData);
      }
    } catch (error: any) {
      console.error('Error fetching allowance bracket codes:', error);
    } finally {
      setLoadingAllowanceBracket(false);
    }
  };

  const fetchWorkshiftCodes = async () => {
    setLoadingWorkshift(true);
    try {
      const response = await apiClient.get('/Fs/Process/AllowanceAndEarnings/WorkShiftSetUp');
      if (response.status === 200 && response.data) {
        const mappedData = response.data.map((item: any) => ({
          id: item.id || item.workShiftID || 0,
          code: item.code || item.workShiftCode || '',
          description: item.description || item.workShiftDesc || '',
        }));
        setWorkshiftCodes(mappedData);
      }
    } catch (error: any) {
      console.error('Error fetching workshift codes:', error);
    } finally {
      setLoadingWorkshift(false);
    }
  };

  // Filtered lists for modals
  const filteredEarningCodes = earningCodes.filter(item =>
    item.code.toLowerCase().includes(earningCodeSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(earningCodeSearchTerm.toLowerCase())
  );

  const filteredAllowanceBracketCodes = allowanceBracketCodes.filter(item =>
    item.code.toLowerCase().includes(allowanceBracketSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(allowanceBracketSearchTerm.toLowerCase())
  );

  const filteredWorkshiftCodes = workshiftCodes.filter(item =>
    item.code.toLowerCase().includes(workshiftSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(workshiftSearchTerm.toLowerCase())
  );

  // Pagination for main table
  const totalPages = Math.ceil(bracketingData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = bracketingData.slice(startIndex, startIndex + itemsPerPage);

  // Pagination for earning code modal
  const [earningCodePage, setEarningCodePage] = useState(1);
  const totalEarningPages = Math.ceil(filteredEarningCodes.length / modalItemsPerPage);
  const earningCodeStartIndex = (earningCodePage - 1) * modalItemsPerPage;
  const paginatedEarningCodes = filteredEarningCodes.slice(earningCodeStartIndex, earningCodeStartIndex + modalItemsPerPage);

  // Pagination for allowance bracket code modal
  const totalAllowanceBracketPages = Math.ceil(filteredAllowanceBracketCodes.length / modalItemsPerPage);
  const allowanceBracketStartIndex = (allowanceBracketPage - 1) * modalItemsPerPage;
  const paginatedAllowanceBracketCodes = filteredAllowanceBracketCodes.slice(allowanceBracketStartIndex, allowanceBracketStartIndex + modalItemsPerPage);

  // Pagination for workshift code modal
  const totalWorkshiftPages = Math.ceil(filteredWorkshiftCodes.length / modalItemsPerPage);
  const workshiftStartIndex = (workshiftPage - 1) * modalItemsPerPage;
  const paginatedWorkshiftCodes = filteredWorkshiftCodes.slice(workshiftStartIndex, workshiftStartIndex + modalItemsPerPage);

  // Reset pages on search term changes
  useEffect(() => { setCurrentPage(1); }, [allowanceBracketCode, workshiftCode]);
  useEffect(() => { setEarningCodePage(1); }, [earningCodeSearchTerm]);
  useEffect(() => { setAllowanceBracketPage(1); }, [allowanceBracketSearchTerm]);
  useEffect(() => { setWorkshiftPage(1); }, [workshiftSearchTerm]);

  const handleCreateNew = () => {
    setFormData({ noOfHours: '', amount: '', earningCode: '' });
    setShowCreateModal(true);
  };

  const handleEdit = (item: AllowanceBracketing) => {
    setEditingItem(item);
    setFormData({
      noOfHours: item.noOfHrs.toString(),
      amount: item.amount.toString(),
      earningCode: item.earningCode
    });
    setShowEditModal(true);
  };

  const handleDelete = async (item: AllowanceBracketing) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Confirm Delete',
      text: `Are you sure you want to delete this entry?`,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (confirmed.isConfirmed) {
      try {
        await apiClient.delete(`/Fs/Process/AllowanceAndEarnings/AllowanceBracketingSetUp/${item.id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Allowance bracketing entry deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        await fetchBracketingData();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to delete entry';
        await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
        console.error('Error deleting entry:', error);
      }
    }
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.noOfHours || !formData.amount || !formData.earningCode) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: 0,
        dayType: dayType,
        noOfHrs: parseFloat(formData.noOfHours),
        earningCode: formData.earningCode,
        amount: parseFloat(formData.amount),
        code: allowanceBracketCode,
        workShiftCode: workshiftCode,
        byEmploymentStatFlag: byEmploymentStatus,
        employmentStatus: '',
      };

      await apiClient.post('/Fs/Process/AllowanceAndEarnings/AllowanceBracketingSetUp', payload);
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Allowance bracketing entry created successfully.', timer: 2000, showConfirmButton: false });

      await fetchBracketingData();
      setShowCreateModal(false);
      setFormData({ noOfHours: '', amount: '', earningCode: '' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
      console.error('Error creating entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem) return;

    if (!formData.noOfHours || !formData.amount || !formData.earningCode) {
      await Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: parseInt(editingItem.id),
        dayType: editingItem.dayType,
        noOfHrs: parseFloat(formData.noOfHours),
        earningCode: formData.earningCode,
        amount: parseFloat(formData.amount),
        code: editingItem.code,
        workShiftCode: editingItem.workShiftCode,
        byEmploymentStatFlag: editingItem.byEmploymentStatFlag,
        employmentStatus: editingItem.employmentStatus,
      };

      await apiClient.put(`/Fs/Process/AllowanceAndEarnings/AllowanceBracketingSetUp/${editingItem.id}`, payload);
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Allowance bracketing entry updated successfully.', timer: 2000, showConfirmButton: false });

      await fetchBracketingData();
      setShowEditModal(false);
      setEditingItem(null);
      setFormData({ noOfHours: '', amount: '', earningCode: '' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'An error occurred';
      await Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
      console.error('Error updating entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingItem(null);
    setFormData({ noOfHours: '', amount: '', earningCode: '' });
  };

  const handleOpenEarningCodeSearch = () => {
    setEarningCodeSearchTerm('');
    setShowEarningCodeModal(true);
  };

  const handleSelectEarningCode = (code: string) => {
    setFormData({ ...formData, earningCode: code });
    setShowEarningCodeModal(false);
    setEarningCodeSearchTerm('');
  };

  const handleOpenAllowanceBracketSearch = () => {
    setAllowanceBracketSearchTerm('');
    setAllowanceBracketPage(1);
    fetchAllowanceBracketCodes();
    setShowAllowanceBracketModal(true);
  };

  const handleSelectAllowanceBracketCode = (code: string) => {
    setAllowanceBracketCode(code);
    setShowAllowanceBracketModal(false);
    setAllowanceBracketSearchTerm('');
  };

  const handleOpenWorkshiftSearch = () => {
    setWorkshiftSearchTerm('');
    setWorkshiftPage(1);
    fetchWorkshiftCodes();
    setShowWorkshiftModal(true);
  };

  const handleSelectWorkshiftCode = (code: string) => {
    setWorkshiftCode(code);
    setShowWorkshiftModal(false);
    setWorkshiftSearchTerm('');
  };

  // ESC key handler with proper hierarchy
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateModal || showEditModal) {
          event.preventDefault();
          event.stopPropagation();
          if (showCreateModal) {
            setShowCreateModal(false);
            setFormData({ noOfHours: '', amount: '', earningCode: '' });
          } else if (showEditModal) {
            setShowEditModal(false);
            setEditingItem(null);
            setFormData({ noOfHours: '', amount: '', earningCode: '' });
          }
          return;
        }

        if (showEarningCodeModal) {
          event.preventDefault();
          setShowEarningCodeModal(false);
          setEarningCodeSearchTerm('');
          return;
        }

        if (showAllowanceBracketModal) {
          event.preventDefault();
          setShowAllowanceBracketModal(false);
          setAllowanceBracketSearchTerm('');
          return;
        }

        if (showWorkshiftModal) {
          event.preventDefault();
          setShowWorkshiftModal(false);
          setWorkshiftSearchTerm('');
          return;
        }
      }
    };

    if (showCreateModal || showEditModal || showEarningCodeModal || showAllowanceBracketModal || showWorkshiftModal) {
      document.addEventListener('keydown', handleEscKey, true);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey, true);
    };
  }, [showCreateModal, showEditModal, showEarningCodeModal, showAllowanceBracketModal, showWorkshiftModal]);

  const dayTypeOptions = [
    { value: 'RegDay', label: 'Regular Day' },
    { value: 'SpecHol', label: 'Special Holiday' },
    { value: 'RegHol', label: 'Regular Holiday' },
    { value: 'RestDay', label: 'Rest Day' },
  ];

  // Reusable pagination renderer
  const renderPagination = (
    currentPageNum: number,
    totalPagesNum: number,
    setPage: (n: number) => void,
    totalItems: number,
    startIdx: number,
    perPage: number
  ) => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">
        Showing {totalItems > 0 ? startIdx + 1 : 0} to {Math.min(startIdx + perPage, totalItems)} of {totalItems} entries
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(Math.max(currentPageNum - 1, 1))}
          disabled={currentPageNum === 1}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPagesNum }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`px-3 py-1 rounded ${currentPageNum === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setPage(Math.min(currentPageNum + 1, totalPagesNum))}
          disabled={currentPageNum >= totalPagesNum || totalItems === 0}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

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
              {/* First Row - Create New and Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                {(hasPermission('Add') && hasPermission('View')) && (
                  <button
                    onClick={handleCreateNew}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                )}
                {hasPermission('View') && (
                  <>
                    <select
                      value={dayType}
                      onChange={(e) => setDayType(e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    >
                      {dayTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
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
                  </>
                )}
              </div>

              {/* Second Row - Search Fields */}
              {hasPermission('View') && (
                <div className="flex items-center gap-4 mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {/* Allowance Bracket Code */}
                  <div className="flex items-center gap-2 relative">
                    <label className="text-sm text-gray-700 whitespace-nowrap">Allowance Bracket Code :</label>
                    <input
                      type="text"
                      value={allowanceBracketCode}
                      onChange={(e) => setAllowanceBracketCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Type or search..."
                    />
                    <button
                      type="button"
                      onClick={handleOpenAllowanceBracketSearch}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Search Allowance Bracket Code"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      onClick={fetchBracketingData}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Search
                    </button>
                  </div>

                  {/* Workshift Code */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 whitespace-nowrap">Workshift Code :</label>
                    <input
                      type="text"
                      value={workshiftCode}
                      onChange={(e) => setWorkshiftCode(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Type or search..."
                    />
                    <button
                      type="button"
                      onClick={handleOpenWorkshiftSearch}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Search Workshift Code"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button
                      onClick={fetchBracketingData}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Search
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600 text-sm">Loading allowance bracketing data...</div>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              ) : hasPermission('View') ? (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">No of Hours [hh.mm]</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Earning Code</th>
                      {(hasPermission('Edit') || hasPermission('Delete')) && (
                        <th className="px-6 py-3 text-center text-xs text-gray-600 uppercase">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{item.noOfHrs}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.amount}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.earningCode}</td>
                          {(hasPermission('Edit') || hasPermission('Delete')) && (
                            <td className="px-6 py-4 whitespace-nowrap">
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
                                {hasPermission('Edit') && hasPermission('Delete') && (
                                  <span className="text-gray-300">|</span>
                                )}
                                {hasPermission('Delete') && (
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
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
              ) : (
                <div className="text-center py-10 text-gray-500">
                  You do not have permission to view this list.
                </div>
              )}
            </div>

            {/* Pagination */}
            {hasPermission('View') && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Showing {bracketingData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, bracketingData.length)} of {bracketingData.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages || 1, prev + 1))}
                    disabled={currentPage >= totalPages || bracketingData.length === 0}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ALLOWANCE BRACKET CODE SEARCH MODAL (z-50) ── */}
      {showAllowanceBracketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-gray-900">Search Allowance Bracket Code</h2>
              <button
                onClick={() => { setShowAllowanceBracketModal(false); setAllowanceBracketSearchTerm(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-blue-600 mb-4">Allowance Bracket Code</h3>

              {/* Search Input */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={allowanceBracketSearchTerm}
                  onChange={(e) => setAllowanceBracketSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  placeholder="Search by code or description..."
                />
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {loadingAllowanceBracket ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-600 text-sm">Loading allowance bracket codes...</div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedAllowanceBracketCodes.length > 0 ? (
                        paginatedAllowanceBracketCodes.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleSelectAllowanceBracketCode(item.code)}
                          >
                            <td className="px-6 py-3 text-sm text-gray-900">{item.code}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-8 text-center text-gray-500 text-sm">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {renderPagination(allowanceBracketPage, totalAllowanceBracketPages, setAllowanceBracketPage, filteredAllowanceBracketCodes.length, allowanceBracketStartIndex, modalItemsPerPage)}
            </div>
          </div>
        </div>
      )}

      {/* ── WORKSHIFT CODE SEARCH MODAL (z-50) ── */}
      {showWorkshiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-gray-900">Search Workshift Code</h2>
              <button
                onClick={() => { setShowWorkshiftModal(false); setWorkshiftSearchTerm(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-blue-600 mb-4">Workshift Code</h3>

              {/* Search Input */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <label className="text-sm text-gray-700">Search:</label>
                <input
                  type="text"
                  value={workshiftSearchTerm}
                  onChange={(e) => setWorkshiftSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  placeholder="Search by code or description..."
                />
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {loadingWorkshift ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-600 text-sm">Loading workshift codes...</div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-600 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedWorkshiftCodes.length > 0 ? (
                        paginatedWorkshiftCodes.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50 cursor-pointer"
                            onClick={() => handleSelectWorkshiftCode(item.code)}
                          >
                            <td className="px-6 py-3 text-sm text-gray-900">{item.code}</td>
                            <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-8 text-center text-gray-500 text-sm">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {renderPagination(workshiftPage, totalWorkshiftPages, setWorkshiftPage, filteredWorkshiftCodes.length, workshiftStartIndex, modalItemsPerPage)}
            </div>
          </div>
        </div>
      )}

      {/* ── EARNING CODE SEARCH MODAL (z-50) ── */}
      {showEarningCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h2 className="text-gray-900">Search Earning Code</h2>
              <button
                onClick={() => { setShowEarningCodeModal(false); setEarningCodeSearchTerm(''); }}
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
                {loadingEarnings ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-600 text-sm">Loading earning codes...</div>
                  </div>
                ) : (
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
                          key={item.id}
                          className="hover:bg-blue-50 cursor-pointer"
                          onClick={() => handleSelectEarningCode(item.code)}
                        >
                          <td className="px-6 py-3 text-sm text-gray-900">{item.code}</td>
                          <td className="px-6 py-3 text-sm text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {renderPagination(earningCodePage, totalEarningPages, setEarningCodePage, filteredEarningCodes.length, earningCodeStartIndex, modalItemsPerPage)}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE MODAL (z-[60]) ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h2 className="text-gray-900">Create New</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="p-6">
              <h3 className="text-blue-600 mb-4">Allowance Bracketing Setup</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">No of Hours :</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.noOfHours}
                    onChange={(e) => setFormData({ ...formData, noOfHours: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">Amount :</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="40"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">Earning Code :</label>
                  <input
                    type="text"
                    value={formData.earningCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                    placeholder="Click Search to select"
                  />
                  <button
                    type="button"
                    onClick={handleOpenEarningCodeSearch}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  {submitting ? 'Saving...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  Back to List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL (z-[60]) ── */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <h2 className="text-gray-900">Edit</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6">
              <h3 className="text-blue-600 mb-4">Allowance Bracketing Setup</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">No of Hours :</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.noOfHours}
                    onChange={(e) => setFormData({ ...formData, noOfHours: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">Amount :</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-gray-700 text-sm whitespace-nowrap w-32">Earning Code :</label>
                  <input
                    type="text"
                    value={formData.earningCode}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleOpenEarningCodeSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm text-sm"
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
    </div>
  );
}