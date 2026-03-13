import { useState, useRef, useEffect, JSX } from 'react';
import { Calendar, Check, Upload, Users, Building2, Briefcase, Wallet, Grid } from 'lucide-react';
import apiClient, { getLoggedInUsername } from '../../services/apiClient';
import Swal from 'sweetalert2';
import { Footer } from '../Footer/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface GroupItem {
  id: number;
  code: string;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CalendarPopup
// ─────────────────────────────────────────────────────────────────────────────
interface CalendarPopupProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function parseDate(str: string): Date | null {
  const p = str?.trim().split('/');
  if (p?.length !== 3) return null;
  const [m, d, y] = p.map(Number);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}

function CalendarPopup({ value, onChange, onClose, position }: CalendarPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  const init = parseDate(value) ?? new Date();
  const [month, setMonth] = useState(init.getMonth());
  const [year,  setYear]  = useState(init.getFullYear());

  const yearNow = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = 1900; y <= yearNow + 10; y++) yearOptions.push(y);

  const daysInMonth    = new Date(year, month + 1, 0).getDate();
  const dayOptions: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) dayOptions.push(d);

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const prevMonthDays  = new Date(year, month, 0).getDate();

  const selectedDay = (() => {
    const p = parseDate(value);
    if (p && p.getFullYear() === year && p.getMonth() === month) return p.getDate();
    return -1;
  })();

  const isToday = (d: number) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d;
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const select = (d: number) => { onChange(`${month + 1}/${d}/${year}`); onClose(); };
  const today  = () => { const t = new Date(); onChange(`${t.getMonth()+1}/${t.getDate()}/${t.getFullYear()}`); onClose(); };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  const handleDayDropdown = (d: number) => { onChange(`${month + 1}/${d}/${year}`); onClose(); };

  const renderDays = (): JSX.Element[] => {
    const cells: JSX.Element[] = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--)
      cells.push(
        <div key={`p${i}`} className="h-8 flex items-center justify-center text-sm text-gray-300 select-none">
          {prevMonthDays - i}
        </div>
      );

    for (let d = 1; d <= daysInMonth; d++) {
      const sel = d === selectedDay;
      const tod = isToday(d);
      cells.push(
        <div key={d} onClick={() => select(d)}
          className={[
            'h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors select-none',
            sel ? 'bg-blue-600 text-white font-semibold'
                : tod ? 'border border-blue-400 text-blue-600 font-medium hover:bg-blue-50'
                : 'text-gray-700 hover:bg-blue-100',
          ].join(' ')}>
          {d}
        </div>
      );
    }

    const rem = 42 - cells.length;
    for (let d = 1; d <= rem; d++)
      cells.push(
        <div key={`n${d}`} className="h-8 flex items-center justify-center text-sm text-gray-300 select-none">
          {d}
        </div>
      );

    return cells;
  };

  return (
    <div ref={popupRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-[9999]"
      style={{ top: position.top, left: position.left, width: '320px' }}>

      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700">
            {MONTH_NAMES.map((mn, idx) => <option key={mn} value={idx}>{mn}</option>)}
          </select>

          <select defaultValue="" onChange={e => { if (e.target.value) handleDayDropdown(Number(e.target.value)); }}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 w-16">
            <option value="">Day</option>
            {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700">
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <button type="button" onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map(h => (
          <div key={h} className="h-7 flex items-center justify-center text-xs font-medium text-gray-500">{h}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {renderDays()}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <button type="button" onClick={today}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors">
          Today
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab definition
// ─────────────────────────────────────────────────────────────────────────────
type TabName = 'TK Group' | 'Branch' | 'Department' | 'Designation' | 'Division' | 'Section';

const TABS: { name: TabName; icon: React.ElementType }[] = [
  { name: 'TK Group',    icon: Users     },
  { name: 'Branch',      icon: Building2 },
  { name: 'Department',  icon: Briefcase },
  { name: 'Designation', icon: Briefcase },
  { name: 'Division',    icon: Wallet    },
  { name: 'Section',     icon: Grid      },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const toDateString = (dateStr: string): string => {
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return '';
  const [m, d, y] = parts.map(Number);
  if (isNaN(m) || isNaN(d) || isNaN(y)) return '';
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${mm}/${dd}/${y}`;
};

const getCodes = (items: GroupItem[], ids: number[]): string => {
  if (ids.length === 0) return ',';
  return items.filter(i => ids.includes(i.id)).map(i => i.code).join(',');
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export function ExportNAVPage() {
  const [activeTab,        setActiveTab]        = useState<TabName>('TK Group');
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [showCalendar,     setShowCalendar]     = useState<'dateFrom' | 'dateTo' | 'postingDate' | null>(null);
  const [isExporting,      setIsExporting]      = useState(false);

  const todayStr = () => { const t = new Date(); return `${t.getMonth()+1}/${t.getDate()}/${t.getFullYear()}`; };
  const [dateFrom,    setDateFrom]    = useState(todayStr);
  const [dateTo,      setDateTo]      = useState(todayStr);
  const [postingDate, setPostingDate] = useState(todayStr);

  const [groupSearchTerm,  setGroupSearchTerm]  = useState('');
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const itemsPerPage = 10;

  const [tkGroupItems,       setTKSGroupItems]      = useState<GroupItem[]>([]);
  const [branchItems,        setBranchItems]        = useState<GroupItem[]>([]);
  const [departmentItems,    setDepartmentItems]    = useState<GroupItem[]>([]);
  const [groupScheduleItems, setGroupScheduleItems] = useState<GroupItem[]>([]);
  const [payHouseItems,      setPayHouseItems]      = useState<GroupItem[]>([]);
  const [sectionItems,       setSectionItems]       = useState<GroupItem[]>([]);

  const [selectedTKGroups,       setSelectedTKGroups]       = useState<number[]>([]);
  const [selectedBranches,       setSelectedBranches]       = useState<number[]>([]);
  const [selectedDepartments,    setSelectedDepartments]    = useState<number[]>([]);
  const [selectedGroupSchedules, setSelectedGroupSchedules] = useState<number[]>([]);
  const [selectedPayHouses,      setSelectedPayHouses]      = useState<number[]>([]);
  const [selectedSections,       setSelectedSections]       = useState<number[]>([]);

  useEffect(() => { setCurrentGroupPage(1); setGroupSearchTerm(''); }, [activeTab]);

  useEffect(() => {
    const userName = getLoggedInUsername();
  const url = userName && userName !== 'Guest'
    ? `/Fs/Process/TimeKeepGroupSetUp/by-user?userName=${encodeURIComponent(userName)}`
    : `/Fs/Process/TimeKeepGroupSetUp`;

  apiClient.get(url).then(res => {
    const items: GroupItem[] = (res.data ?? []).map((i: any) => ({
      id: i.ID ?? i.id,
      code: i.groupCode ?? i.code ?? '',
      description: i.groupDescription ?? i.description ?? '',
    })).filter((i: GroupItem) => i.id !== 0);
    setTKSGroupItems(items);
    setSelectedTKGroups([]);
  }).catch(() => {});
}, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/BranchSetUp').then(res => {
      const items: GroupItem[] = res.data.map((i: any) => ({
        id: i.braID ?? i.ID ?? i.id,
        code: i.braCode ?? i.code,
        description: i.braDesc ?? i.description,
      }));
      setBranchItems(items);
      setSelectedBranches([]); // unchecked on load / refresh
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/DepartmentSetUp').then(res => {
      const items: GroupItem[] = res.data.map((i: any) => ({
        id: i.depID ?? i.ID ?? i.id,
        code: i.depCode ?? i.code,
        description: i.depDesc ?? i.description,
      }));
      setDepartmentItems(items);
      setSelectedDepartments([]); // unchecked on load / refresh
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/DesignationSetUp').then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      const items: GroupItem[] = list.map((i: any) => ({
        id: i.desID ?? i.ID ?? i.id,
        code: i.desCode ?? i.code,
        description: i.desDesc ?? i.description,
      }));
      setGroupScheduleItems(items);
      setSelectedGroupSchedules([]); // unchecked on load / refresh
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/DivisionSetUp').then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      const items: GroupItem[] = list.map((i: any) => ({
        id: i.divID ?? i.ID ?? i.id,
        code: i.divCode ?? i.code,
        description: i.divDesc ?? i.description,
      }));
      setPayHouseItems(items);
      setSelectedPayHouses([]); // unchecked on load / refresh
    }).catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.get('/Fs/Employment/SectionSetUp').then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      const items: GroupItem[] = list.map((i: any) => ({
        id: i.secID ?? i.ID ?? i.id,
        code: i.secCode ?? i.sectionCode ?? i.code,
        description: i.secDesc ?? i.Description ?? i.description,
      }));
      setSectionItems(items);
      setSelectedSections([]); // unchecked on load / refresh
    }).catch(() => {});
  }, []);

  const getCurrentItems = (): GroupItem[] => {
    switch (activeTab) {
      case 'Branch':      return branchItems;
      case 'Department':  return departmentItems;
      case 'Designation': return groupScheduleItems;
      case 'Division':    return payHouseItems;
      case 'Section':     return sectionItems;
      default:            return tkGroupItems;
    }
  };

  const getCurrentSelected = (): number[] => {
    switch (activeTab) {
      case 'Branch':      return selectedBranches;
      case 'Department':  return selectedDepartments;
      case 'Designation': return selectedGroupSchedules;
      case 'Division':    return selectedPayHouses;
      case 'Section':     return selectedSections;
      default:            return selectedTKGroups;
    }
  };

  const setCurrentSelected = (ids: number[]) => {
    switch (activeTab) {
      case 'Branch':      setSelectedBranches(ids);       break;
      case 'Department':  setSelectedDepartments(ids);    break;
      case 'Designation': setSelectedGroupSchedules(ids); break;
      case 'Division':    setSelectedPayHouses(ids);      break;
      case 'Section':     setSelectedSections(ids);       break;
      default:            setSelectedTKGroups(ids);       break;
    }
  };

  const currentItems = getCurrentItems();
  const selectedIds  = getCurrentSelected();

  const filteredGroups  = currentItems.filter(item =>
    item.code.toLowerCase().includes(groupSearchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(groupSearchTerm.toLowerCase())
  );

  const totalGroupPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startGroupIndex = (currentGroupPage - 1) * itemsPerPage;
  const endGroupIndex   = startGroupIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startGroupIndex, endGroupIndex);

  const handleToggle = (id: number) =>
    setCurrentSelected(selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id]);

  const handleSelectAll = () =>
    setCurrentSelected(
      selectedIds.length === currentItems.length
        ? []
        : currentItems.map(i => i.id)
    );

  const getGroupPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalGroupPages <= 7) {
      for (let i = 1; i <= totalGroupPages; i++) pages.push(i);
    } else {
      if (currentGroupPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...'); pages.push(totalGroupPages);
      } else if (currentGroupPage >= totalGroupPages - 3) {
        pages.push(1); pages.push('...');
        for (let i = totalGroupPages - 4; i <= totalGroupPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push('...');
        for (let i = currentGroupPage - 1; i <= currentGroupPage + 1; i++) pages.push(i);
        pages.push('...'); pages.push(totalGroupPages);
      }
    }
    return pages;
  };

  const openCalendar = (e: React.MouseEvent<HTMLElement>, field: 'dateFrom' | 'dateTo' | 'postingDate') => {
    const el = e.currentTarget;
    let rect: DOMRect;
    if (el.tagName === 'BUTTON') {
      const input = el.previousElementSibling as HTMLElement;
      rect = input?.getBoundingClientRect() ?? el.getBoundingClientRect();
    } else {
      rect = el.getBoundingClientRect();
    }
    setCalendarPosition({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setShowCalendar(field);
  };

  const handleDateChange = (date: string) => {
    if      (showCalendar === 'dateFrom')    setDateFrom(date);
    else if (showCalendar === 'dateTo')      setDateTo(date);
    else if (showCalendar === 'postingDate') setPostingDate(date);
    setShowCalendar(null);
  };

  // ── handleExport ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!dateFrom) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please select Date From.' }); return;
    }
    if (!dateTo) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please select Date To.' }); return;
    }
    if (!postingDate) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Please select Posting Date.' }); return;
    }

    const dfParsed = parseDate(dateFrom);
    const dtParsed = parseDate(dateTo);
    if (dfParsed && dtParsed && dfParsed > dtParsed) {
      Swal.fire({ icon: 'warning', title: 'Validation', text: 'Date From cannot be greater than Date To.' }); return;
    }

    const requestBody = {
      UserName:    getLoggedInUsername(),
      Groups:      getCodes(tkGroupItems,       selectedTKGroups),
      Departments: getCodes(departmentItems,    selectedDepartments),
      Divisions:   getCodes(groupScheduleItems, selectedGroupSchedules),
      Branch:      getCodes(branchItems,        selectedBranches),
      Designation: getCodes(groupScheduleItems, selectedGroupSchedules),
      Section:     getCodes(sectionItems,       selectedSections),
      DateFrom:    toDateString(dateFrom),
      DateTo:      toDateString(dateTo),
      PostingDate: toDateString(postingDate),
    };

    // ── Swal loading modal — blocks UI while SP runs ──────────────────────────
    Swal.fire({
      title: 'Exporting...',
      text: 'Please wait while your file is being prepared.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => { Swal.showLoading(); },
    });

    setIsExporting(true);

    try {
      const response = await apiClient.post('/ExportNav/export', requestBody, {
        responseType: 'blob',
      });

      const cd = response.headers['content-disposition'] as string | undefined;
      let fileName = `NAV_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      if (cd) {
        const match = cd.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) fileName = match[1].replace(/['"]/g, '').trim();
      }

      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Replace loading with success
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: `File "${fileName}" has been downloaded.`,
        timer: 2500,
        showConfirmButton: false,
      });

    } catch (error: any) {
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          // Replace loading with error
          Swal.fire({ icon: 'error', title: 'Export Failed', text: json.message || 'An error occurred.' });
        } catch {
          Swal.fire({ icon: 'error', title: 'Export Failed', text: 'An unexpected error occurred.' });
        }
      } else {
        // Replace loading with error
        Swal.fire({
          icon: 'error',
          title: 'Export Failed',
          text: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const selectionCounts: Record<TabName, number> = {
    'TK Group':    selectedTKGroups.length,
    'Branch':      selectedBranches.length,
    'Department':  selectedDepartments.length,
    'Designation': selectedGroupSchedules.length,
    'Division':    selectedPayHouses.length,
    'Section':     selectedSections.length,
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 relative z-10 p-6">
        <div className="max-w-7xl mx-auto relative">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
            <h1 className="text-white">Export NAV</h1>
          </div>

          {/* Content */}
          <div className="bg-white rounded-b-lg shadow-lg p-6 relative">

            {/* Info Banner */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">
                    Export payroll and timekeeping data to NAV (Navision) accounting system. Select the date range and posting date, then choose the groups to export.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {['Export to NAV accounting system','Filter by date range','Select groups and departments','Set posting dates'].map(text => (
                      <div key={text} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Filters + Export Button */}
            <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-6 flex-wrap">

                {/* Date From */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Date From</label>
                  <div className="flex items-center gap-1">
                    <input type="text" value={dateFrom} readOnly
                      onClick={e => openCalendar(e as any, 'dateFrom')}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32 cursor-pointer bg-white"
                    />
                    <button type="button" onClick={e => openCalendar(e, 'dateFrom')}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Date To */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Date To</label>
                  <div className="flex items-center gap-1">
                    <input type="text" value={dateTo} readOnly
                      onClick={e => openCalendar(e as any, 'dateTo')}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32 cursor-pointer bg-white"
                    />
                    <button type="button" onClick={e => openCalendar(e, 'dateTo')}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Posting Date */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Posting Date</label>
                  <div className="flex items-center gap-1">
                    <input type="text" value={postingDate} readOnly
                      onClick={e => openCalendar(e as any, 'postingDate')}
                      className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-32 cursor-pointer bg-white"
                    />
                    <button type="button" onClick={e => openCalendar(e, 'postingDate')}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Export Button — clean, no spinner (Swal handles loading) */}
                <button type="button" onClick={handleExport} disabled={isExporting}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <Upload className="w-4 h-4" />
                  Export
                </button>
              </div>

              {/* Selection badges */}
              {Object.values(selectionCounts).some(c => c > 0) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {TABS.map(tab => {
                    const count = selectionCounts[tab.name];
                    if (count === 0) return null;
                    return (
                      <span key={tab.name} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {tab.name}: {count}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex items-center gap-1 border-b border-gray-200 flex-wrap">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.name;
                  const count    = selectionCounts[tab.name];
                  return (
                    <button key={tab.name} type="button" onClick={() => setActiveTab(tab.name)}
                      className={`px-4 py-2 text-sm transition-colors flex items-center gap-2 rounded-t-lg ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50'
                      }`}>
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                      {count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                        }`}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div className="mb-4 flex justify-end">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Search:</label>
                <input type="text" value={groupSearchTerm}
                  onChange={e => { setGroupSearchTerm(e.target.value); setCurrentGroupPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-gray-700 w-12">
                        <input
                          type="checkbox"
                          checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                          ref={el => {
                            if (el) el.indeterminate =
                              selectedIds.length > 0 && selectedIds.length < currentItems.length;
                          }}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Code</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedGroups.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedGroups.map(item => {
                        const isChecked = selectedIds.includes(item.id);
                        return (
                          <tr key={item.id} onClick={() => handleToggle(item.id)}
                            className={`cursor-pointer transition-colors ${
                              isChecked ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                            }`}>
                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                              <input type="checkbox" checked={isChecked}
                                onChange={() => handleToggle(item.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <div className="text-gray-600 text-xs">
                  Showing {filteredGroups.length === 0 ? 0 : startGroupIndex + 1} to{' '}
                  {Math.min(endGroupIndex, filteredGroups.length)} of {filteredGroups.length} entries
                </div>
                <div className="flex gap-1">
                  <button type="button"
                    onClick={() => setCurrentGroupPage(p => Math.max(p - 1, 1))}
                    disabled={currentGroupPage === 1}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  {getGroupPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span key={`e${idx}`} className="px-1 text-gray-500 text-xs">...</span>
                    ) : (
                      <button key={page} type="button"
                        onClick={() => setCurrentGroupPage(page as number)}
                        className={`px-2 py-1 rounded text-xs ${
                          currentGroupPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}>
                        {page}
                      </button>
                    )
                  )}
                  <button type="button"
                    onClick={() => setCurrentGroupPage(p => Math.min(p + 1, totalGroupPages))}
                    disabled={currentGroupPage === totalGroupPages || totalGroupPages === 0}
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Calendar Popup */}
      {showCalendar && (
        <CalendarPopup
          value={
            showCalendar === 'dateFrom'    ? dateFrom
            : showCalendar === 'dateTo'    ? dateTo
            : postingDate
          }
          onChange={handleDateChange}
          onClose={() => setShowCalendar(null)}
          position={calendarPosition}
        />
      )}
       <Footer />
     </div>
   );
 }