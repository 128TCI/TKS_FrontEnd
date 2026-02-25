import { useState, useEffect } from 'react';
import { Mail, Briefcase, Settings, FlaskConical, RefreshCw } from 'lucide-react';
import { Footer } from '../Footer/Footer';
import { CalendarPopover } from '../Modals/CalendarPopover';
import { EmailConfigurationModal } from '../Modals/EmailConfigurationModal';
import apiClient from '../../services/apiClient';
import Swal from 'sweetalert2';

interface GroupItem {
  id: number;
  code: string;
  description: string;
}

interface EmployeeItem {
  id: number;
  code: string;
  name: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared — Pagination Bar
// ─────────────────────────────────────────────────────────────────────────────

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (currentPage > 3) pages.push('...');
  const start = Math.max(2, currentPage - 1);
  const end   = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

function PaginationBar({
  currentPage, totalPages, setPage, startIdx, endIdx, total,
}: {
  currentPage: number; totalPages: number; setPage: (p: number) => void;
  startIdx: number; endIdx: number; total: number;
}) {
  return (
    <div className="flex items-center justify-between mt-3">
      <span className="text-gray-500 text-xs">
        Showing {total === 0 ? 0 : startIdx + 1} to {endIdx} of {total} entries
      </span>
      <div className="flex gap-1 flex-wrap">
        <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Previous
        </button>
        {getPageNumbers(currentPage, totalPages).map((page, idx) =>
          page === '...'
            ? <span key={`e${idx}`} className="px-1 text-gray-400 text-xs self-center">…</span>
            : <button key={`p${page}`} type="button" onClick={() => setPage(page as number)}
                className={`px-2 py-1 rounded text-xs ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}>
                {page}
              </button>
        )}
        <button type="button" onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          Next
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function TimekeepEmailDistributionPage() {
  const formName = 'Timekeep Email Distribution';

  // Department
  const [departmentItems,     setDepartmentItems]     = useState<GroupItem[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [departmentSearch,    setDepartmentSearch]    = useState('');
  const [currentDeptPage,     setCurrentDeptPage]     = useState(1);

  // Employee
  const [employeeItems,     setEmployeeItems]     = useState<EmployeeItem[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [employeeSearch,    setEmployeeSearch]    = useState('');
  const [currentEmpPage,    setCurrentEmpPage]    = useState(1);
  const [statusFilter,      setStatusFilter]      = useState<'active' | 'inactive' | 'all'>('active');

  // Report options
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [reportType, setReportType] = useState('');

  // Selection state
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  // Modal
  const [showEmailConfig, setShowEmailConfig] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get('/Fs/Employment/DepartmentSetUp');
        setDepartmentItems(res.data.map((item: any) => ({
          id:          item.depID ?? item.ID,
          code:        item.depCode ?? item.code,
          description: item.depDesc ?? item.description,
        })));
      } catch (e) { console.error('Failed to load departments', e); }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await apiClient.get('/Maintenance/EmployeeMasterFile');
        const list = Array.isArray(res.data) ? res.data : [];
        setEmployeeItems(list.map((item: any) => ({
          id:   item.empID ?? item.ID,
          code: item.empCode ?? item.code ?? '',
          name: `${item.lName ?? ''}, ${item.fName ?? ''} ${item.mName ?? ''}`.trim(),
        })));
      } catch (e) { console.error('Failed to load employees', e); }
    };
    load();
  }, []);

  const filteredDepts = departmentItems.filter(d =>
    d.code.toLowerCase().includes(departmentSearch.toLowerCase()) ||
    d.description.toLowerCase().includes(departmentSearch.toLowerCase())
  );
  const filteredEmps = employeeItems.filter(e =>
    e.code.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    e.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const totalDeptPages = Math.ceil(filteredDepts.length / itemsPerPage);
  const totalEmpPages  = Math.ceil(filteredEmps.length  / itemsPerPage);
  const startDeptIdx   = (currentDeptPage - 1) * itemsPerPage;
  const endDeptIdx     = Math.min(startDeptIdx + itemsPerPage, filteredDepts.length);
  const startEmpIdx    = (currentEmpPage  - 1) * itemsPerPage;
  const endEmpIdx      = Math.min(startEmpIdx  + itemsPerPage, filteredEmps.length);
  const paginatedDepts = filteredDepts.slice(startDeptIdx, endDeptIdx);
  const paginatedEmps  = filteredEmps.slice(startEmpIdx,  endEmpIdx);

  const handleDeptToggle     = (id: number) => setSelectedDepartments(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleEmpToggle      = (id: number) => setSelectedEmployees(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleSelectAllDepts = () => setSelectedDepartments(selectedDepartments.length === filteredDepts.length ? [] : filteredDepts.map(d => d.id));
  const handleSelectAllEmps  = () => setSelectedEmployees(selectedEmployees.length === filteredEmps.length ? [] : filteredEmps.map(e => e.id));

  const handleTestEmail = async () => {
    try {
      // await apiClient.post('/EmailConfiguration/SendTestEmail')
      await Swal.fire({ icon: 'success', title: 'Test Email Sent', text: 'Test email was sent successfully.', timer: 2000, showConfirmButton: false });
    } catch {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to send test email.' });
    }
  };

  const handleSendReport = async () => {
    if (!selectedDepartments.length && !selectedEmployees.length) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Please select department(s) or employee(s).', timer: 2000, showConfirmButton: true });
      return;
    }
    if (!dateFrom || !dateTo) {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Please select Date From and Date To.', timer: 2000, showConfirmButton: true });
      return;
    }
    try {
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Emails sent successfully.', timer: 2000, showConfirmButton: false });
      setSelectedDepartments([]);
      setSelectedEmployees([]);
      setDateFrom('');
      setDateTo('');
    } catch (e) { console.error(e); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">{formName}</h1>
          </div>

          {/* Content */}
          <div className="bg-white rounded-b-lg shadow-lg p-6">

            {/* Department Tab */}
            <div className="mb-6 flex items-center gap-1 border-b border-gray-200">
              <button type="button"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white -mb-px rounded-t-lg flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Department
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Left: Department Table ── */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm text-gray-700">Search:</label>
                  <input type="text" value={departmentSearch}
                    onChange={e => { setDepartmentSearch(e.target.value); setCurrentDeptPage(1); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs text-gray-600 w-10">
                          <input type="checkbox"
                            checked={filteredDepts.length > 0 && selectedDepartments.length === filteredDepts.length}
                            onChange={handleSelectAllDepts}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        </th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                        <th className="px-4 py-2 text-left text-xs text-gray-600">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedDepts.length > 0 ? paginatedDepts.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input type="checkbox" checked={selectedDepartments.includes(d.id)}
                              onChange={() => handleDeptToggle(d.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{d.code}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{d.description}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">No departments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <PaginationBar currentPage={currentDeptPage} totalPages={totalDeptPages}
                  setPage={setCurrentDeptPage} startIdx={startDeptIdx} endIdx={endDeptIdx} total={filteredDepts.length} />
              </div>

              {/* ── Right: Employee + Report Options ── */}
              <div className="space-y-6">

                {/* Employee Table */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <label className="text-sm text-gray-700">Search:</label>
                    <input type="text" value={employeeSearch}
                      onChange={e => { setEmployeeSearch(e.target.value); setCurrentEmpPage(1); }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs text-gray-600 w-10">
                            <input type="checkbox"
                              checked={filteredEmps.length > 0 && selectedEmployees.length === filteredEmps.length}
                              onChange={handleSelectAllEmps}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                          </th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Code</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedEmps.length > 0 ? paginatedEmps.map(e => (
                          <tr key={e.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">
                              <input type="checkbox" checked={selectedEmployees.includes(e.id)}
                                onChange={() => handleEmpToggle(e.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{e.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{e.name}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-gray-400">No employees found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <PaginationBar currentPage={currentEmpPage} totalPages={totalEmpPages}
                    setPage={setCurrentEmpPage} startIdx={startEmpIdx} endIdx={endEmpIdx} total={filteredEmps.length} />

                  {/* Status radios */}
                  <div className="mt-4 flex items-center gap-6">
                    {(['active', 'inactive', 'all'] as const).map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="statusFilter" value={s}
                          checked={statusFilter === s} onChange={() => setStatusFilter(s)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                        <span className="text-sm text-gray-700">
                          {s === 'inactive' ? 'In Active' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Report Options */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                  <h2 className="text-gray-700 mb-4">Report Options</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-28 flex-shrink-0">Report Type:</label>
                      <select value={reportType} onChange={e => setReportType(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                        <option value="">-- Select --</option>
                        <option value="DTR">Daily Time Record</option>
                        <option value="ASR">Attendance Summary Report</option>
                        <option value="EmplRawInOut">Employee Raw In and Out</option>
                      </select>
                    </div>
                    {/* Date Range */}
                    <h2 className="text-gray-700 mb-4">Date Range</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 whitespace-nowrap">From:</label>
                        <input
                            placeholder='MM/DD/YY'
                            type="text"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                        />
                        <CalendarPopover date={dateFrom} onChange={setDateFrom} />
                        </div>
                        <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700 whitespace-nowrap">To:</label>
                        <input
                            placeholder='MM/DD/YY'
                            type="text"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32"
                        />
                        <CalendarPopover date={dateTo} onChange={setDateTo} />
                        </div>
                    </div>

                    {/* Email config buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button type="button" onClick={() => setShowEmailConfig(true)}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-gray-500" />
                        Email Configuration
                      </button>
                      <button type="button" onClick={handleTestEmail}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-gray-500" />
                        Test Email Configuration
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                    <button type="button" onClick={handleSendReport}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send Report
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal 1 — Email Configuration */}
      <EmailConfigurationModal
        isOpen={showEmailConfig}
        onClose={() => setShowEmailConfig(false)}
      />
    </div>
  );
}