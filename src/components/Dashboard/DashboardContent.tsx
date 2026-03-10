import {
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart3,
  Calendar,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { getLoggedInUsername } from '../../services/apiClient';

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 flex-1">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">
          Welcome back, {getLoggedInUsername() ?? 'User'}
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your timekeeping today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Active Employees"
          value="247"
          change="+12 this month"
          changeType="positive"
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Hours This Week"
          value="9,845"
          change="+5.2% vs last week"
          changeType="positive"
          color="cyan"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Exceptions"
          value="18"
          change="Needs attention"
          changeType="warning"
          color="amber"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved Time Cards"
          value="229"
          change="92.7% completion"
          changeType="positive"
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            icon={FileText}
            title="Review Time Cards"
            description="View and approve pending time cards"
            action="Go to Time Cards"
          />
          <QuickActionCard
            icon={Users}
            title="Manage Employees"
            description="Add, edit, or deactivate employees"
            action="Manage Employees"
          />
          <QuickActionCard
            icon={BarChart3}
            title="Generate Reports"
            description="Create custom reports and exports"
            action="View Reports"
          />
          <QuickActionCard
            icon={AlertCircle}
            title="Exception Review"
            description="Handle exceptions and discrepancies"
            action="Review Exceptions"
          />
          <QuickActionCard
            icon={Calendar}
            title="Schedule Management"
            description="Update shifts and schedules"
            action="Manage Schedules"
          />
          <QuickActionCard
            icon={TrendingUp}
            title="Process Payroll"
            description="Calculate and post payroll data"
            action="Process Now"
          />
        </div>
      </div>

      {/* Recent Activity + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem
              type="success"
              title="Payroll Posted"
              description="Period ending 11/30/2025 successfully posted"
              time="2 hours ago"
            />
            <ActivityItem
              type="info"
              title="New Employee Added"
              description="Sarah Johnson added to Sales department"
              time="4 hours ago"
            />
            <ActivityItem
              type="warning"
              title="Exception Created"
              description="Missing punch for employee #1247"
              time="Yesterday"
            />
            <ActivityItem
              type="success"
              title="Data Backup Complete"
              description="Automated backup finished successfully"
              time="Yesterday"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4">Upcoming Tasks</h3>
          <div className="space-y-4">
            <TaskItem title="Weekly Payroll Processing" due="Due in 2 days" priority="high" />
            <TaskItem title="Monthly Report Generation" due="Due in 5 days" priority="medium" />
            <TaskItem title="Employee Schedule Update" due="Due in 1 week" priority="low" />
            <TaskItem title="Quarterly Data Backup" due="Due in 2 weeks" priority="medium" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'warning' | 'negative';
  color: 'blue' | 'cyan' | 'amber' | 'green';
}

function StatCard({ icon: Icon, label, value, change, changeType, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    cyan: 'from-cyan-500 to-cyan-600',
    amber: 'from-amber-500 to-amber-600',
    green: 'from-green-500 to-green-600',
  };
  const changeColors = {
    positive: 'text-green-600',
    warning: 'text-amber-600',
    negative: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mb-1">
        <div className="text-gray-900 text-3xl">{value}</div>
      </div>
      <div className="text-gray-600 mb-2">{label}</div>
      <div className={`text-sm ${changeColors[changeType]}`}>{change}</div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  action: string;
}

function QuickActionCard({ icon: Icon, title, description, action }: QuickActionCardProps) {
  return (
    <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left group">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
      <h4 className="text-gray-900 mb-1">{title}</h4>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <div className="text-blue-600 text-sm">{action} →</div>
    </button>
  );
}

interface ActivityItemProps {
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ type, title, description, time }: ActivityItemProps) {
  const dotColors = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  return (
    <div className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotColors[type]}`} />
      <div className="flex-1">
        <div className="text-gray-900">{title}</div>
        <div className="text-gray-600 text-sm">{description}</div>
        <div className="text-gray-500 text-xs mt-1">{time}</div>
      </div>
    </div>
  );
}

interface TaskItemProps {
  title: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
}

function TaskItem({ title, due, priority }: TaskItemProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="flex-1">
        <div className="text-gray-900">{title}</div>
        <div className="text-gray-600 text-sm mt-1">{due}</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs ${priorityColors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    </div>
  );
}