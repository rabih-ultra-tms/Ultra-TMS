'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChartBarIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

// Mock dashboard data
const dashboardStats = [
  {
    id: 1,
    name: 'Active Loads',
    value: '124',
    change: '+12',
    changeType: 'increase',
    icon: TruckIcon,
    color: 'blue',
    href: '/loads',
  },
  {
    id: 2,
    name: 'Revenue MTD',
    value: '$1.25M',
    change: '+8.2%',
    changeType: 'increase',
    icon: CurrencyDollarIcon,
    color: 'green',
    href: '/analytics',
  },
  {
    id: 3,
    name: 'Active Carriers',
    value: '89',
    change: '+5',
    changeType: 'increase',
    icon: UserGroupIcon,
    color: 'purple',
    href: '/carriers',
  },
  {
    id: 4,
    name: 'Pending Documents',
    value: '23',
    change: '-3',
    changeType: 'decrease',
    icon: DocumentTextIcon,
    color: 'orange',
    href: '/documents',
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'load_created',
    title: 'New load created',
    description: 'Load #LD-2024-0156 - Chicago to Dallas',
    time: '5 minutes ago',
    icon: TruckIcon,
    iconColor: 'blue',
  },
  {
    id: 2,
    type: 'load_dispatched',
    title: 'Load dispatched',
    description: 'Load #LD-2024-0155 assigned to Carrier XYZ',
    time: '15 minutes ago',
    icon: CheckCircleIcon,
    iconColor: 'green',
  },
  {
    id: 3,
    type: 'document_pending',
    title: 'Document requires attention',
    description: 'Insurance certificate expiring in 7 days',
    time: '1 hour ago',
    icon: ExclamationTriangleIcon,
    iconColor: 'orange',
  },
  {
    id: 4,
    type: 'load_delivered',
    title: 'Load delivered',
    description: 'Load #LD-2024-0150 completed successfully',
    time: '2 hours ago',
    icon: CheckCircleIcon,
    iconColor: 'green',
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: 'Follow up on quote #QT-2024-0234',
    dueDate: 'Today, 2:00 PM',
    priority: 'high',
    category: 'Sales',
  },
  {
    id: 2,
    title: 'Process invoices for completed loads',
    dueDate: 'Today, 4:00 PM',
    priority: 'high',
    category: 'Accounting',
  },
  {
    id: 3,
    title: 'Review carrier compliance documents',
    dueDate: 'Tomorrow, 10:00 AM',
    priority: 'medium',
    category: 'Operations',
  },
  {
    id: 4,
    title: 'Weekly team meeting',
    dueDate: 'Tomorrow, 2:00 PM',
    priority: 'medium',
    category: 'Management',
  },
];

export default function DashboardPage() {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    // Get user info from token or storage
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real app, decode token or fetch user info
      // For now, just show a generic greeting
      setUserName('Admin');
    }
  }, []);

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    };
    return colors[color] || colors.blue;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, 'error' | 'warning' | 'default'> = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };
    return colors[priority] || 'default';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userName}!`}
        description="Here's what's happening with your operations today"
        actions={
          <div className="flex gap-2">
            <Link href="/analytics/dashboards">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50">
                <ChartBarIcon className="inline h-4 w-4 mr-2" />
                View Analytics
              </button>
            </Link>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Link key={stat.id} href={stat.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
                  <div className="mt-2 flex items-center">
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="ml-2 text-sm text-slate-500">from last week</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${getIconColor(stat.color)}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <Link href="/activity" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getIconColor(activity.iconColor)}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-sm text-slate-500">{activity.description}</p>
                  <div className="mt-1 flex items-center text-xs text-gray-400 dark:text-gray-500">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h3>
            <Link href="/tasks" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center text-xs text-slate-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {task.dueDate}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                      <span className="text-xs text-slate-500">{task.category}</span>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/loads/new">
            <button className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
              <TruckIcon className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Create Load</span>
            </button>
          </Link>
          <Link href="/carriers/search">
            <button className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
              <UserGroupIcon className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Find Carrier</span>
            </button>
          </Link>
          <Link href="/documents/upload">
            <button className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
              <DocumentTextIcon className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Upload Document</span>
            </button>
          </Link>
          <Link href="/analytics/reports">
            <button className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
              <ChartBarIcon className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </button>
          </Link>
        </div>
      </Card>

      {/* Administration Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Administration</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/users">
            <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <UserGroupIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900">User Management</h4>
                  <p className="text-xs text-slate-500">Manage system users</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/roles">
            <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <UserGroupIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900">Role Management</h4>
                  <p className="text-xs text-slate-500">Configure roles & permissions</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/admin/settings">
            <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-900">Tenant Settings</h4>
                  <p className="text-xs text-slate-500">Company & system config</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
