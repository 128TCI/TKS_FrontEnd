import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Check, Save, RotateCcw, X, Search } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { Footer } from '../Footer/Footer';
import { EmployeeSearchModal } from './../Modals/EmployeeSearchModal';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';
import { toISO } from '../../services/utilityService';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface EmployeeModalItem {
  empCode: string;
  name: string;
  groupCode: string;
}

export function UpdateSssNotificationPage() {
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [appliedDate,   setAppliedDate]   = useState('');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [isUpdating,    setIsUpdating]    = useState(false);
  const itemsPerPage = 10;

  const [headCode,           setHeadCode]           = useState('');
  const [head,               setHead]               = useState('');
  const [showHeadCodeModal,  setShowHeadCodeModal]  = useState(false);

  const [tkGroupItems,     setTKSGroupItems]    = useState<GroupItem[]>([]);
  const [employeeData,     setEmployeeData]     = useState<EmployeeModalItem[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError,    setEmployeeError]    = useState('');

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Load TK Groups on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
        const data = Array.isArray(res.data) ? res.data : [];
        setTKSGroupItems(data.map((i: any) => ({
          id:          i.ID   ?? i.id   ?? 0,
          code:        i.groupCode ?? i.code ?? '',
          description: i.groupDescription ?? i.description ?? '',
        })));
      } catch (err) {
        console.error('Failed to load TK Groups:', err);
      }
    };
    load();
  }, []);

  // Load employees for modal on mount
  useEffect(() => {
    const load = async () => {
      setLoadingEmployees(true);
      setEmployeeError('');
      try {
        const res = await apiClient.get('/Maintenance/EmployeeMasterFile');
        const list = Array.isArray(res.data) ? res.data : [];
        setEmployeeData(list.map((emp: any) => ({
          empCode:   emp.empCode || emp.code || '',
          name:      `${emp.lName || ''}, ${emp.fName || ''} ${emp.mName || ''}`.trim(),
          groupCode: emp.grpCode || '',
        })));
      } catch (err: any) {
        setEmployeeError(err.message || 'Failed to load employees');
      } finally {
        setLoadingEmployees(false);
      }
    };
    load();
  }, []);

  const selectedGroupCodes = selectedItems
    .map(id => tkGroupItems.find(g => g.id === id)?.code ?? '')
    .filter(Boolean);

  const filteredEmployees = selectedGroupCodes.length > 0
    ? employeeData.filter(emp => selectedGroupCodes.includes(emp.groupCode))
    : employeeData;

  const filteredGroups = tkGroupItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages    = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const endIndex      = startIndex + itemsPerPage;
  const paginatedItem = filteredGroups.slice(startIndex, endIndex);

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...'); pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1); pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1); pages.push('...');
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push('...'); pages.push(total);
    }
    return pages;
  };


  const resetForm = () => {
    setSelectedItems([]);
    setDateFrom('');
    setDateTo('');
  };

  const handleUpdate = async () => {
    if (!selectedItems.length) { await showErrorModal('Please select TK Group item/s.'); return; }
    if (!headCode)             { await showErrorModal('Please select an employee.'); return; }
    if (!dateFrom || !dateTo)  { await showErrorModal('Please select Date From and Date To.'); return; }
    if (!appliedDate)          { await showErrorModal('Please select Applied Date.'); return; }
    try {
      setIsUpdating(true);
      const res = await apiClient.post('/Utilities/UpdateSSSNotification', {
        DateFrom: toISO(dateFrom),
        DateTo:   toISO(dateTo),
        AppliedDate: toISO(appliedDate),
        EmpCode:  headCode,
        Mode:     'Update',
      });
      if (ApiService.isApiSuccess(res)) {
        await showSuccessModal('SSS Notification successfully updated.');
        resetForm();
      }
    } catch {
      await showErrorModal('Failed to update records.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnpost = async () => {
    if (!selectedItems.length) { await showErrorModal('Please select TK Group item/s.'); return; }
    if (!dateFrom || !dateTo)  { await showErrorModal('Please select Date From and Date To.'); return; }
    try {
      setIsUpdating(true);
      const res = await apiClient.post('/Utilities/UpdateSSSNotification', {
        DateFrom: toISO(dateFrom),
        DateTo:   toISO(dateTo),
        EmpCode:  headCode,
        Mode:     'Unpost',
      });
      if (ApiService.isApiSuccess(res)) {
        await showSuccessModal('SSS Notification successfully unposted.');
        resetForm();
      }
    } catch {
      await showErrorModal('Failed to unpost records.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderPagination = (
    current: number, total: number, setPage: (p: number) => void,
    startIdx: number, endIdx: number, totalCount: number
  ) => (
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs text-gray-500">
        Showing {totalCount === 0 ? 0 : startIdx + 1} to {Math.min(endIdx, totalCount)} of {totalCount} entries
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        {getPageNumbers(current, total).map((page, idx) =>
          page === '...'
            ? <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
            : <button key={page} onClick={() => setPage(page as number)}
                className={`px-2 py-1 rounded text-xs ${current === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                {page}
              </button>
        )}
        <button onClick={() => setPage(Math.min(total, current + 1))} disabled={current === total || total === 0}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update SSS Notification</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Update SSS notification records for processed employees. Manage social security notifications and track applied dates efficiently.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Select TK groups and date range', 'Search employees by code',
                      'Set applied date for notifications', 'Update or unpost changes'].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left — TK Group list */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">{selectedItems.length} selected</span>
                </div>                 
                <div className="mb-4 flex items-center gap-3">
                  <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input type="text" placeholder="Search..." value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">
                          <input type="checkbox"
                            checked={paginatedItem.length > 0 && paginatedItem.every(i => selectedItems.includes(i.id))}
                            onChange={e => setSelectedItems(e.target.checked ? paginatedItem.map(i => i.id) : [])}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedItem.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={e => setSelectedItems(prev =>
                                e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                              )}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(currentPage, totalPages, setCurrentPage, startIndex, endIndex, filteredGroups.length)}
              </div>

              {/* Right — Date range + employee picker */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Date Range and Processed Employee</h2>
                <div className="space-y-4">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700">From:</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1" />
                        <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700">To:</label>
                      <div className="flex items-center gap-2">
                        <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1" />
                        <CalendarPopover date={dateTo} onChange={setDateTo} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 w-28 flex-shrink-0">Employee:</label>
                    <input type="text" readOnly
                      value={headCode && head ? `${headCode} - ${head}` : ''}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1 bg-gray-50" />
                    <button onClick={() => setShowHeadCodeModal(true)}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-shrink-0">
                      <Search className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setHead(''); setHeadCode(''); }}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 w-24">Date Applied:</label>
                    <input
                      type="text"
                      value={appliedDate}
                      onChange={(e) => setAppliedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-43"
                    />
                    <CalendarPopover date={appliedDate} onChange={setAppliedDate} />
                    
                  </div>                  

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button onClick={handleUpdate} disabled={isUpdating}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4" />
                      {isUpdating ? 'Updating…' : 'Update'}
                    </button>
                    <button onClick={handleUnpost} disabled={isUpdating}
                      className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <RotateCcw className="w-4 h-4" />
                      Unpost
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <EmployeeSearchModal
        isOpen={showHeadCodeModal}
        onClose={() => setShowHeadCodeModal(false)}
        onSelect={(empCode, name) => { setHeadCode(empCode); setHead(name); setShowHeadCodeModal(false); }}
        employees={filteredEmployees}
        loading={loadingEmployees}
        error={employeeError}
      />
      <Footer />
    </div>
  );
}
