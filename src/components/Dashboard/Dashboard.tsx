import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowRight,
  BarChart3,
  Play,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import apiClient, { getLoggedInUsername } from '../../services/apiClient';
import { fetchEmployees, Employee, AuthorizedEmployee } from '../../services/employeeService';

Chart.register(...registerables);

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditTrailEntry {
  id: number;
  date: string;
  user: string;
  pcName: string;
  formName: string;
  accessType: string;
  activity: string;
  message: string;
}

interface OTApplication {
  id: number;
  empCode: string;
  date: string;
  numOTHoursApproved: number | null;
}

interface OTCutoffSummary {
  cutoff1Hours: number;
  cutoff2Hours: number;
  totalHours: number;
  cutoff1Label: string;
  cutoff2Label: string;
  monthLabel: string;
}

function computeOTCutoffs(records: OTApplication[]): OTCutoffSummary {
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const shortNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Always use the current calendar month
  const now     = new Date();
  const year    = now.getFullYear();
  const month   = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const short   = shortNames[month];

  let c1 = 0, c2 = 0;
  for (const r of records) {
    const hrs = r.numOTHoursApproved ?? 0;
    if (hrs <= 0) continue;
    const d = new Date(r.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    d.getDate() <= 15 ? (c1 += hrs) : (c2 += hrs);
  }

  return {
    cutoff1Hours: c1, cutoff2Hours: c2, totalHours: c1 + c2,
    cutoff1Label: `${short} 1–15`,
    cutoff2Label: `${short} 16–${lastDay}`,
    monthLabel:   `${monthNames[month]} ${year}`,
  };
}

function getLoggedInUserId(): string | null {
  const raw = localStorage.getItem('loginPayload');
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    const id = payload?.user?.userID;
    return id != null ? String(id) : null;
  } catch {
    return null;
  }
}

function auditTypeToActivityType(accessType: string): 'success' | 'info' | 'warning' {
  const t = accessType.toLowerCase();
  if (t.includes('delete') || t.includes('error')) return 'warning';
  if (t.includes('login') || t.includes('logout')) return 'info';
  return 'success';
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function Dashboard() {
  const username = getLoggedInUsername() ?? 'User';
  const userId = getLoggedInUserId();  
  const BASENAME = '/DEMO_128TIMEKEEP_NEO';


  // Employee data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [authorizedEmployees, setAuthorizedEmployees] = useState<AuthorizedEmployee[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(true);

  // Audit trail
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // OT is handled by the self-contained OTCard component

  // ── Load employees ──
  const loadEmployees = useCallback(async () => {
    setEmployeeLoading(true);
    try {
      const { employees: emps, authorizedEmployees: authEmps } = await fetchEmployees();
      setEmployees(emps);
      setAuthorizedEmployees(authEmps);
    } catch {
      setEmployees([]);
      setAuthorizedEmployees([]);
    } finally {
      setEmployeeLoading(false);
    }
  }, []);

  // ── Load audit trail ──
  const loadAuditTrail = useCallback(async () => {
    setAuditLoading(true);
    setAuditError(false);
    try {
      const response = await apiClient.get('/AuditTrail/GetAuditTrail/All?page=0&pageSize=200');
      if (response.status === 200 && response.data) {
        const allEntries: AuditTrailEntry[] = (response.data.data ?? []).map((item: any) => ({
          id:         item.id         || 0,
          date:       item.date       || '',
          user:       item.userId     || '',
          pcName:     item.machine    || '',
          formName:   item.formName   || '',
          accessType: item.accessType || '',
          activity:   item.trans      || '',
          message:    item.messages   || '',
        }));
        const userEntries = userId ? allEntries.filter(e => e.user === userId) : allEntries;
        const noLoginOut = userEntries.filter(e => {
          const t = e.accessType.toLowerCase();
          return !t.includes('login') && !t.includes('logout');
        });
        const sorted = noLoginOut.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const seen = new Set<string>();
        const deduped = sorted.filter(entry => {
          const key = `${entry.formName}||${entry.accessType}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 8);
        setAuditTrail(deduped);
        setLastRefreshed(new Date());
      }
    } catch {
      setAuditError(true);
    } finally {
      setAuditLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEmployees();
    loadAuditTrail();
  }, [loadEmployees, loadAuditTrail]);

  useEffect(() => {
    const interval = setInterval(loadAuditTrail, 60_000);
    return () => clearInterval(interval);
  }, [loadAuditTrail]);

  // ── Derived employee counts — based on actual API field values ──
  const activeEmps   = authorizedEmployees.filter(e => e.active);
  const inactiveEmps = authorizedEmployees.filter(e => !e.active);
  const regular      = employees.filter(e => (e.empStatCode ?? '').trim().toUpperCase() === 'REGULAR');
  const probation    = employees.filter(e => (e.empStatCode ?? '').trim().toUpperCase() === 'PROBATION');
  const contractual  = employees.filter(e =>
    e.contractual === true ||
    ['CONT', 'CONTRACTUAL'].includes((e.empStatCode ?? '').trim().toUpperCase())
  );
  const totalCount   = employees.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 flex-1">

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Welcome back, {username}</h1>
        <p className="text-gray-600">Here's what's happening with your timekeeping today</p>
      </div>

      {/* Employee Counts — chart spans 2 cols, OT+Leave stacked right */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Employee Counts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* Combined chart — spans 2 cols, fills full height */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="mb-1">
              <div className="text-gray-900 font-medium text-sm">All Employee Types</div>
              <div className="text-gray-500 text-xs mt-0.5">Current workforce snapshot</div>
            </div>

            {/* Count badges */}
            <div className="flex gap-6 mb-4 mt-3 flex-wrap">

              {/* Total */}
              <div>
                {employeeLoading
                  ? <div className="h-7 w-10 bg-gray-100 rounded animate-pulse" />
                  : <div className="text-2xl font-medium" style={{ color: '#378ADD' }}>{totalCount}</div>
                }
                <div className="text-gray-400 text-xs">Total</div>
              </div>

              {/* Active */}
              {!employeeLoading && (
                <div>
                  <div className="text-2xl font-medium text-green-600">{activeEmps.length}</div>
                  <span className="inline-flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    <span className="text-green-600 text-xs font-medium">Active</span>
                  </span>
                </div>
              )}

              {/* Inactive */}
              {!employeeLoading && (
                <div>
                  <div className="text-2xl font-medium text-gray-400">{inactiveEmps.length}</div>
                  <span className="inline-flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                    <span className="text-gray-400 text-xs font-medium">Inactive</span>
                  </span>
                </div>
              )}

              <div className="w-px bg-gray-200 self-stretch mx-1" />

              {[
                { label: 'Regular',     value: employeeLoading ? null : regular.length,     color: '#1D9E75' },
                { label: 'Probation',   value: employeeLoading ? null : probation.length,   color: '#BA7517' },
                { label: 'Contractual', value: employeeLoading ? null : contractual.length, color: '#D4537E' },
              ].map(s => (
                <div key={s.label}>
                  {s.value === null
                    ? <div className="h-7 w-10 bg-gray-100 rounded animate-pulse" />
                    : <div className="text-2xl font-medium" style={{ color: s.color }}>{s.value}</div>
                  }
                  <div className="text-gray-400 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex-1 min-h-0">
              <EmployeeCombinedChart
                loading={employeeLoading}
                total={totalCount}
                regular={regular.length}
                probation={probation.length}
                contractual={contractual.length}
              />
            </div>
          </div>

          {/* Right column — OT + Leave stacked */}
          <div className="flex flex-col gap-6">
            <OTCard />
            <LeaveCard />
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={Play}
            title="Process Raw Data"
            description="Process and validate employee raw timekeeping data"
            action="Process Now"
            href={`${BASENAME}/process/process-data`}
          />
          <QuickActionCard
            icon={Settings}
            title="Employee TimeKeep Configuration"
            description="Configure timekeeping settings per employee"
            action="Go to Configuration"
            href={`${BASENAME}/maintenance/employee-timekeep-configuration`}
          />
          <QuickActionCard
            icon={BarChart3}
            title="Generate Reports"
            description="Create TK reports and export"
            action="View Reports"
            href={`${BASENAME}/reports/daily-time-record-monitoring`}
          />
        </div>
      </div>

      {/* 128 Products + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 128 Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">128 Products</h3>
          <div className="space-y-3">
            <ProductItem name="128 Payroll System"           count="128 active accounts" color="#378ADD" />
            <ProductItem name="128 HR Information System"    count="128 active accounts" color="#1D9E75" />
            <ProductItem name="128 Employee Online System"   count="128 active accounts" color="#BA7517" />
            <ProductItem name="128 Recruitment System"       count="128 active accounts" color="#D4537E" />
          </div>
        </div>

        {/* Recent Activity — live from audit trail */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Recent Activity</h3>
              {!auditLoading && !auditError && (
                <p className="text-gray-400 text-xs mt-0.5">
                  Refreshed {formatTime(lastRefreshed.toISOString())} · auto-updates every 60s
                </p>
              )}
            </div>
            <button
              onClick={loadAuditTrail}
              disabled={auditLoading}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-40"
              title="Refresh now"
            >
              <RefreshCw className={`w-4 h-4 ${auditLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {auditLoading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-2 h-2 mt-2 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-36" />
                    <div className="h-3 bg-gray-100 rounded w-52" />
                    <div className="h-2.5 bg-gray-100 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!auditLoading && auditError && (
            <div className="text-center py-6">
              <p className="text-red-500 text-sm mb-2">Could not load activity.</p>
              <button onClick={loadAuditTrail} className="text-blue-600 text-sm hover:underline">Try again</button>
            </div>
          )}

          {!auditLoading && !auditError && auditTrail.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">No recent activity found.</p>
          )}

          {!auditLoading && !auditError && auditTrail.length > 0 && (
            <div className="space-y-4">
              {auditTrail.map(entry => (
                <AuditActivityItem key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Combined Employee Chart (all 4 types in one chart.js chart) ─────────────

interface CombinedChartProps {
  loading: boolean;
  total: number;
  regular: number;
  probation: number;
  contractual: number;
}

function EmployeeCombinedChart({ loading, total, regular, probation, contractual }: CombinedChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef  = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || loading) return;
    chartRef.current?.destroy();

    // No historical data available — show current snapshot as a horizontal bar chart
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: ['Total', 'Regular', 'Probation', 'Contractual'],
        datasets: [
          {
            label: 'Employees',
            data: [total, regular, probation, contractual],
            backgroundColor: ['#378ADD22', '#1D9E7533', '#BA751733', '#D4537E33'],
            borderColor:      ['#378ADD',   '#1D9E75',   '#BA7517',   '#D4537E'],
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 0, bottom: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'white',
            titleColor: '#374151',
            bodyColor: '#6b7280',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x} employees`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: '#f3f4f6', drawTicks: false },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 }, padding: 6 },
            beginAtZero: true,
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#374151', font: { size: 12 }, padding: 8 },
          },
        },
        datasets: {
          bar: { barThickness: 28, maxBarThickness: 32 },
        } as any,
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, [loading, total, regular, probation, contractual]);

  if (loading) {
    return <div className="w-full h-full bg-gray-50 rounded-lg animate-pulse" />;
  }

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}

// ─── OT Approved Hours Card ───────────────────────────────────────────────────

function OTCard() {
  const [otSummary, setOtSummary] = useState<OTCutoffSummary | null>(null);
  const [otLoading, setOtLoading] = useState(true);
  const [otError, setOtError]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/Maintenance/EmployeeOvertimeApplication');
        const records: OTApplication[] = (
          Array.isArray(res.data) ? res.data : res.data?.data ?? []
        ).map((item: any) => ({
          id: item.id ?? 0,
          empCode: (item.empCode ?? '').trim(),
          date: item.date ?? '',
          numOTHoursApproved: item.numOTHoursApproved ?? 0,
        }));
        setOtSummary(computeOTCutoffs(records));
      } catch {
        setOtError(true);
      } finally {
        setOtLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const displayMonth = otSummary?.monthLabel ?? `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-gray-900 font-semibold text-sm">OT Approved Hours</div>
          <div className="text-gray-400 text-xs mt-0.5">{displayMonth}</div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
        </div>
      </div>

      {otLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
      ) : otError ? (
        <p className="text-red-400 text-sm">Could not load OT data.</p>
      ) : (
        <>
          {/* Big number */}
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-3xl font-bold text-cyan-600">{otSummary?.totalHours ?? 0}</span>
            <span className="text-sm text-gray-400">hrs</span>
          </div>
          <div className="text-gray-400 text-xs mb-4">Total approved this month</div>

          {/* Single total row — same style as Leave Applications */}
          <div className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
            <span className="text-gray-500 text-sm">Applications</span>
            <span className="text-gray-900 font-bold text-sm">{otSummary?.totalHours ?? 0}h</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Leave Approved Hours Card ────────────────────────────────────────────────

function LeaveCard() {
  const [totalHours, setTotalHours]   = useState<number | null>(null);
  const [totalCount, setTotalCount]   = useState<number | null>(null);
  const [monthLabel, setMonthLabel]   = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/Maintenance/EmployeeLeaveApplication');
        const records: any[] = Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? [];

        const monthNames = ['January','February','March','April','May','June',
                            'July','August','September','October','November','December'];

        // Always use current month
        const now   = new Date();
        const year  = now.getFullYear();
        const month = now.getMonth();

        setMonthLabel(`${monthNames[month]} ${year}`);

        const inMonth = records.filter(r => {
          const d = new Date(r.date);
          return d.getFullYear() === year && d.getMonth() === month;
        });

        setTotalHours(inMonth.reduce((sum, r) => sum + (r.hoursApprovedNum ?? 0), 0));
        setTotalCount(inMonth.length);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-gray-900 font-semibold text-sm">Leave Applications</div>
          <div className="text-gray-400 text-xs mt-0.5">{monthLabel}</div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-3 w-28 bg-gray-100 rounded" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">Could not load leave data.</p>
      ) : (
        <>
          {/* Big number */}
          <div className="flex items-baseline gap-1 mb-0.5">
            <span className="text-3xl font-bold text-emerald-600">{totalHours ?? 0}</span>
            <span className="text-sm text-gray-400">hrs</span>
          </div>
          <div className="text-gray-400 text-xs mb-4">Total approved this month</div>

          {/* Applications count row */}
          <div className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
            <span className="text-gray-500 text-sm">Applications</span>
            <span className="text-gray-900 font-bold text-sm">{totalCount ?? 0}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action: string;
  href: string;
}

function QuickActionCard({ icon: Icon, title, description, action, href }: QuickActionCardProps) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left group block no-underline"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
      <h4 className="text-gray-900 font-medium mb-1">{title}</h4>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <div className="text-blue-600 text-sm">{action} →</div>
    </a>
  );
}

// ─── Product Item ─────────────────────────────────────────────────────────────

function ProductItem({ name, count, color }: { name: string; count: string; color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div>
        <div className="text-gray-900 text-sm font-medium">{name}</div>
        <div className="text-gray-500 text-xs">{count}</div>
      </div>
    </div>
  );
}

// ─── Audit Activity Item ──────────────────────────────────────────────────────

function AuditActivityItem({ entry }: { entry: AuditTrailEntry }) {
  const type = auditTypeToActivityType(entry.accessType);
  const dotColors = { success: 'bg-green-500', info: 'bg-blue-500', warning: 'bg-amber-500' };

  return (
    <div className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotColors[type]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-gray-900 font-medium text-sm">{entry.formName || entry.accessType}</div>
        <div className="text-gray-600 text-sm truncate">{entry.activity || entry.message}</div>
        <div className="text-gray-500 text-xs mt-1">{formatTime(entry.date)}</div>
      </div>
    </div>
  );
}