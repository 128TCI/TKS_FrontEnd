import { useState, useEffect } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { Footer } from '../Footer/Footer';
import { ApiService, showErrorModal, showSuccessModal } from '../../services/apiService';
import apiClient from '../../services/apiClient';
import { toISO } from '../../services/utilityService';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

export function UpdateDaytypeRawdataPage() {
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [dayTypeOption,  setDayTypeOption]  = useState<'dateIn' | 'dateOut'>('dateIn');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedItems,  setSelectedItems]  = useState<number[]>([]);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [isUpdating,     setIsUpdating]     = useState(false);
  const [tkGroupItems,   setTKSGroupItems]  = useState<GroupItem[]>([]);
  const itemsPerPage = 10;

  // ── Load TK Group list ────────────────────────────────────────────────────

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

  // ── Filtering + pagination ────────────────────────────────────────────────

  const filteredGroups = tkGroupItems.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages     = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex     = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredGroups.slice(startIndex, startIndex + itemsPerPage);

  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | string)[] = [];
    if (currentPage <= 4)                   { for (let i = 1; i <= 5; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    else if (currentPage >= totalPages - 3) { pages.push(1); pages.push('...'); for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i); }
    else { pages.push(1); pages.push('...'); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  // ── Selection handlers ────────────────────────────────────────────────────

  const handleSelectAll  = (checked: boolean) =>
    setSelectedItems(checked ? paginatedItems.map(item => item.id) : []);
  const handleSelectItem = (id: number, checked: boolean) =>
    setSelectedItems(prev => checked ? [...prev, id] : prev.filter(i => i !== id));

  // ── Update ────────────────────────────────────────────────────────────────

  const handleUpdate = async () => {
    if (!selectedItems.length) { await showErrorModal('Please select TK Group item/s.'); return; }
    if (!dateFrom || !dateTo)  { await showErrorModal('Please select Date From and Date To.'); return; }

    try {
      setIsUpdating(true);

      // Send group codes (not IDs) to match what the backend SP expects
      const payload = {
        tkGroupList:  selectedItems.map(id => tkGroupItems.find(g => g.id === id)?.code ?? String(id)),
        dateFrom:     toISO(dateFrom),
        dateTo:       toISO(dateTo),
        updateOption: dayTypeOption,
      };

      const [addTmpRes, updateRes] = await Promise.all([
        apiClient.post('/Utilities/AddtmpTable',      payload),
        apiClient.post('/Utilities/UpdatetkGroupList', payload),
      ]);

      if (ApiService.isApiSuccess(addTmpRes) && ApiService.isApiSuccess(updateRes)) {
        await showSuccessModal('Successfully updated Raw Day Type.');
        setSelectedItems([]);
        setDateFrom('');
        setDateTo('');
      } else {
        await showErrorModal(addTmpRes.data?.message ?? updateRes.data?.message ?? 'Update failed.');
      }
    } catch (err: any) {
      await showErrorModal(err?.response?.data?.message ?? 'Failed to update records.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Update Raw Day Type</h1>
          </div>

          <div className="bg-white rounded-b-lg shadow-lg p-6">

            {/* Info banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-3">
                    Update day type in raw data for selected groups within a specified date range.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Select groups and date range', 'Choose day type option before update'].map(t => (
                      <div key={t} className="flex items-start gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
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
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                    {selectedItems.length} selected
                  </span>
                </div>
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input type="text" value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">
                          <input type="checkbox"
                            checked={paginatedItems.length > 0 && paginatedItems.every(i => selectedItems.includes(i.id))}
                            onChange={e => handleSelectAll(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedItems.length === 0
                        ? <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No groups found.</td></tr>
                        : paginatedItems.map(item => (
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
                    Showing {filteredGroups.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredGroups.length)} of {filteredGroups.length} entries
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

              {/* Right — Date range + Option */}
              <div className="space-y-6">

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h2 className="text-gray-700 mb-4">Date Range</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-16">From:</label>
                      <input type="text" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                      <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-16">To:</label>
                      <input type="text" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32" />
                      <CalendarPopover date={dateTo} onChange={setDateTo} />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h2 className="text-gray-700 mb-4">Option</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      {([
                        { value: 'dateIn',  label: 'Day Type [Date In]'  },
                        { value: 'dateOut', label: 'Day Type [Date Out]' },
                      ] as const).map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="dayTypeOption" value={opt.value}
                            checked={dayTypeOption === opt.value}
                            onChange={() => setDayTypeOption(opt.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button onClick={handleUpdate} disabled={isUpdating}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCw className="w-4 h-4" />
                        {isUpdating ? 'Updating…' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
