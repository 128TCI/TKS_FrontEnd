import { useState, useEffect } from 'react';
import { Clock, Check, Search, X, Calculator, Save } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { Footer } from '../Footer/Footer';
import { EmployeeSearchModal } from './../Modals/EmployeeSearchModal';
import { ApiService, showSuccessModal, showErrorModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface BreakDetailRowDto {
  id: number;
  empCode: string;
  workShift: string;
  rawDate: string | null;
  rawBreak1In: string | null;
  rawBreak1Out: string | null;
  rawBreak3In: string | null;
  rawBreak3Out: string | null;
  afterGrace: number | null;
  withinGrace: number | null;
  tardiOrUnder: number;
  groupCode: string;
}

interface BreakSummaryRowDto {
  id: number;
  empCode: string;
  empName?: string;
  appDate: string | null;
  deduct: number | null;
  tardiOrUnder: number;
  rawDateIn: string | null;
  groupCode: string;
}

export function ApplyBreakOverbreakPage() {
  const [dateToApply, setDateToApply] = useState('');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [searchTerm,  setSearchTerm]  = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentPage,   setCurrentPage]   = useState(1);
  const itemsPerPage = 10;

  const [isUpdating,  setIsUpdating]  = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  // Computed data — populated by Compute, sent back by Update
  const [detailRows,  setDetailRows]  = useState<BreakDetailRowDto[]>([]);
  const [summaryRows, setSummaryRows] = useState<BreakSummaryRowDto[]>([]);
  const [detailPage,  setDetailPage]  = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);
  const detailPageSize  = 10;
  const summaryPageSize = 10;

  // Form Fields
  const [headCode, setHeadCode] = useState('');
  const [head,     setHead]     = useState('');

  // Modal state
  const [showHeadCodeModal, setShowHeadCodeModal] = useState(false);

  // TK Group list
  const [tkGroupItems, setTKSGroupItems] = useState<GroupItem[]>([]);

  // Employee list (for EmployeeSearchModal)
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeData,     setEmployeeData]     = useState<Array<{ empCode: string; name: string; groupCode: string }>>([]);
  const [EmployeeError,    setEmployeeError]    = useState('');

  // Reset currentPage when search or data changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm, tkGroupItems]); 

  // Load TK Group list
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/Fs/Process/TimeKeepGroupSetUp');
        setTKSGroupItems((Array.isArray(res.data) ? res.data : []).map((item: any) => ({
          id:          item.ID          ?? item.id          ?? 0,
          code:        item.groupCode   ?? item.code        ?? '',
          description: item.groupDescription ?? item.description ?? '',
        })));
      } catch (err) { console.error('Failed to load TK groups:', err); }
    };
    load();
  }, []);

  // Load employees for EmployeeSearchModal
  useEffect(() => {
    const load = async () => {
      setLoadingEmployees(true);
      setEmployeeError('');
      try {
        const res = await apiClient.get('/Maintenance/EmployeeMasterFile');
        setEmployeeData((Array.isArray(res.data) ? res.data : []).map((emp: any) => ({
          empCode:   emp.empCode ?? emp.code ?? '',
          name:      `${emp.lName ?? ''}, ${emp.fName ?? ''} ${emp.mName ?? ''}`.trim(),
          groupCode: emp.grpCode ?? '',
        })));
      } catch (error: any) {
        setEmployeeError(error.response?.data?.message ?? error.message ?? 'Failed to load employees');
        console.error('Error fetching employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    load();
  }, []);

  const handleHeadCodeSelect = (empCode: string, name: string) => {
    setHeadCode(empCode);
    setHead(name);
    setShowHeadCodeModal(false);
  };

  // Employees filtered by selected TK groups
  const selectedGroupCodes = selectedItems
    .map(id => tkGroupItems.find(g => g.id === id)?.code ?? '')
    .filter(Boolean);

  const filteredEmployees = selectedGroupCodes.length > 0
    ? employeeData.filter(emp => selectedGroupCodes.includes(emp.groupCode))
    : employeeData;

  // Filtered + paginated TK Group list
  const filteredGroups = tkGroupItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages  = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex  = (currentPage - 1) * itemsPerPage;
  const endIndex    = startIndex + itemsPerPage;
  const paginatedItem = filteredGroups.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); return pages; }
    if (currentPage <= 4)           { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    else if (currentPage >= totalPages - 3) { pages.push(1); pages.push('...'); for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i); }
    else { pages.push(1); pages.push('...'); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  const handleSelectAll  = (checked: boolean) =>
    setSelectedItems(checked ? paginatedItem.map(item => item.id) : []);
  const handleSelectItem = (id: number, checked: boolean) =>
    setSelectedItems(prev => checked ? [...prev, id] : prev.filter(i => i !== id));

  const resetForm = () => {
    setSelectedItems([]);
    setHeadCode('');
    setHead('');
    setDateToApply('');
    setDateFrom('');
    setDateTo('');
  };

  const buildComputePayload = () => ({
    empCode:     headCode,
    dateToApply: new Date(dateToApply).toISOString(),
    dateFrom:    new Date(dateFrom).toISOString(),
    dateTo:      new Date(dateTo).toISOString(),
    groupCodes:  selectedItems.map(id => tkGroupItems.find(g => g.id === id)?.code ?? String(id)),
  });

  const handleCompute = async () => {
    if (!selectedItems.length) { await showErrorModal('Please select TK Group item/s.'); return; }
    if (!dateToApply)          { await showErrorModal('Please select Date to Apply.'); return; }
    if (!dateFrom || !dateTo)  { await showErrorModal('Please select Date From and Date To.'); return; }
    try {
      setIsComputing(true);
      const res = await apiClient.post('/Utilities/Compute/ApplyBreakOverbreak', buildComputePayload());
      if (res.data?.success) {
        setDetailRows(res.data.details ?? []);
        setSummaryRows(res.data.summary ?? []);
        setDetailPage(1);
        setSummaryPage(1);
      } else {
        await showErrorModal(res.data?.message ?? 'Compute failed.');
      }
    } catch (err: any) {
      await showErrorModal(err?.response?.data?.message ?? 'Failed to compute records.');
    } finally {
      setIsComputing(false);
    }
  };

  const handleUpdate = async () => {
    if (summaryRows.length === 0) { await showErrorModal('No data to Update. Please Compute first.'); return; }
    try {
      setIsUpdating(true);
      const res = await apiClient.post('/Utilities/Update/ApplyBreakOverbreak', { summary: summaryRows });
      if (res.data?.success) {
        await showSuccessModal(res.data.message ?? 'Successfully updated Break1 and Breaks Overbreak.');
        resetForm();
        setDetailRows([]);
        setSummaryRows([]);
      } else {
        await showErrorModal(res.data?.message ?? 'Failed to update records.');
      }
    } catch (err: any) {
      await showErrorModal(err?.response?.data?.message ?? 'Failed to update records.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Apply Break1 and Breaks Overbreak</h1>
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Information Box */}
            <div className="mb-6 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Apply break time adjustments and manage break overbreak for selected employee groups. Configure break periods and calculate grace periods efficiently.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Select groups and date range','Search employees by code or name','Compute break adjustments','Update to apply changes'].map(t => (
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
                  <Search className="w-4 h-4 text-gray-500" />
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
                            checked={paginatedItem.length > 0 && paginatedItem.every(item => selectedItems.includes(item.id))}
                            onChange={e => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedItem.length === 0
                        ? <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No groups found.</td></tr>
                        : paginatedItem.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input type="checkbox" checked={selectedItems.includes(item.id)}
                                onChange={e => handleSelectItem(item.id, e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{item.description}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-gray-600 text-xs">
                    Showing {filteredGroups.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredGroups.length)} of {filteredGroups.length} entries
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                    {getPageNumbers().map((page, idx) =>
                      page === '...'
                        ? <span key={`e-${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                        : <button key={page} onClick={() => setCurrentPage(page as number)}
                            className={`px-2 py-1 rounded text-xs ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                            {page}
                          </button>
                    )}
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                  </div>
                </div>
              </div>

              {/* Right — Date range + employee picker */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h2 className="text-gray-700 mb-4">Date Range</h2>
                <div className="space-y-4">

                  {/* Date To Apply */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 w-32">Date To Apply:</label>
                    <input type="text" value={dateToApply} onChange={e => setDateToApply(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1" />
                    <CalendarPopover date={dateToApply} onChange={setDateToApply} />
                  </div>

                  {/* From / To */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-sm text-gray-700 w-32">From:</label>
                    <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                    <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    <label className="text-sm text-gray-700">To:</label>
                    <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                    <CalendarPopover date={dateTo} onChange={setDateTo} />
                  </div>

                  {/* Employee picker */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 w-32">Employee:</label>
                    <input type="text" value={headCode && head ? `${headCode} - ${head}` : ''} readOnly
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1" />
                    <button onClick={() => setShowHeadCodeModal(true)}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center">
                      <Search className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setHead(''); setHeadCode(''); }}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button onClick={handleCompute} disabled={isComputing}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Calculator className="w-4 h-4" />{isComputing ? 'Computing…' : 'Compute'}
                    </button>
                    <button onClick={handleUpdate} disabled={isUpdating}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4" />{isUpdating ? 'Updating…' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Break Records Tables */}
            <div className="mt-6 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        {['EmpCode','WorkShift','RawDate','RawBreak1Out','RawBreak1In','RawBreak3Out','RawBreak3In','AfterGrace','WithinGrace'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detailRows.length === 0
                        ? <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">No data available. Click Compute to load records.</td></tr>
                        : detailRows.slice((detailPage-1)*detailPageSize, detailPage*detailPageSize).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 text-xs">
                            <td className="px-3 py-2">{row.empCode}</td>
                            <td className="px-3 py-2">{row.workShift}</td>
                            <td className="px-3 py-2">{row.rawDate ? new Date(row.rawDate).toLocaleDateString() : ''}</td>
                            <td className="px-3 py-2">{row.rawBreak1Out ? new Date(row.rawBreak1Out).toLocaleTimeString() : ''}</td>
                            <td className="px-3 py-2">{row.rawBreak1In  ? new Date(row.rawBreak1In ).toLocaleTimeString() : ''}</td>
                            <td className="px-3 py-2">{row.rawBreak3Out ? new Date(row.rawBreak3Out).toLocaleTimeString() : ''}</td>
                            <td className="px-3 py-2">{row.rawBreak3In  ? new Date(row.rawBreak3In ).toLocaleTimeString() : ''}</td>
                            <td className="px-3 py-2">{row.afterGrace}</td>
                            <td className="px-3 py-2">{row.withinGrace}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                  <span>Page {detailPage} of {Math.max(1, Math.ceil(detailRows.length / detailPageSize))}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setDetailPage(p => Math.max(1, p-1))} disabled={detailPage === 1}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">Previous</button>
                    <button onClick={() => setDetailPage(p => Math.min(Math.ceil(detailRows.length/detailPageSize), p+1))}
                      disabled={detailPage >= Math.ceil(detailRows.length/detailPageSize) || detailRows.length === 0}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">Next</button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        {['EmpCode','Deduct','AppDate'].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-xs text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {summaryRows.length === 0
                        ? <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-500">No data available. Click Compute to load records.</td></tr>
                        : summaryRows.slice((summaryPage-1)*summaryPageSize, summaryPage*summaryPageSize).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 text-xs">
                            <td className="px-3 py-2">{row.empCode}</td>
                            <td className="px-3 py-2">{row.deduct}</td>
                            <td className="px-3 py-2">{row.appDate ? new Date(row.appDate).toLocaleDateString() : ''}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                  <span>Page {summaryPage} of {Math.max(1, Math.ceil(summaryRows.length / summaryPageSize))}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setSummaryPage(p => Math.max(1, p-1))} disabled={summaryPage === 1}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">Previous</button>
                    <button onClick={() => setSummaryPage(p => Math.min(Math.ceil(summaryRows.length/summaryPageSize), p+1))}
                      disabled={summaryPage >= Math.ceil(summaryRows.length/summaryPageSize) || summaryRows.length === 0}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40">Next</button>
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
        onSelect={handleHeadCodeSelect}
        employees={filteredEmployees}
        loading={loadingEmployees}
        error={EmployeeError}
      />
      <Footer />
    </div>
  );
}
