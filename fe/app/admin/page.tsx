'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Users, CreditCard, TrendingUp, DollarSign, UserPlus, Activity } from 'lucide-react'
import { useDashboardStats, useSubscriptionDistribution } from '@/hooks/queries/admin'
import { formatCurrency, formatNumber } from '@/services/admin.service'

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: distribution, isLoading: distLoading } = useSubscriptionDistribution()

  if (statsLoading || distLoading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Overview of system metrics and KPIs</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={formatNumber(stats?.totalUsers || 0)}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          trend={`+${stats?.newUsersToday || 0} today`}
          trendColor="text-green-600"
        />
        <StatCard
          title="Active Subscriptions"
          value={formatNumber(stats?.activeSubscriptions || 0)}
          icon={<CreditCard className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.mrrCents || 0)}
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenueCents || 0)}
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* User Growth & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-zinc-500" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">User Growth</h3>
          </div>
          <div className="space-y-4">
            <GrowthItem label="New Today" value={stats?.newUsersToday || 0} />
            <GrowthItem label="New This Week" value={stats?.newUsersWeek || 0} />
            <GrowthItem label="New This Month" value={stats?.newUsersMonth || 0} />
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <GrowthItem label="Active Users" value={stats?.activeUsers || 0} highlight />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-zinc-500" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Subscription Distribution</h3>
          </div>
          <div className="space-y-3">
            {distribution && distribution.length > 0 ? (
              distribution.map((plan) => (
                <div key={plan.planSlug} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        plan.planSlug === 'executive'
                          ? 'bg-amber-500'
                          : plan.planSlug === 'pro'
                            ? 'bg-primary'
                            : 'bg-zinc-400'
                      }`}
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">{plan.planName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900 dark:text-white">{plan.subscriberCount}</span>
                    <span className="text-sm text-zinc-400">({plan.percentage}%)</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">No subscription data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard label="Active Users" value={stats?.activeUsers || 0} total={stats?.totalUsers || 0} />
        <QuickStatCard label="Paid Users" value={stats?.activeSubscriptions || 0} total={stats?.totalUsers || 0} />
        <QuickStatCard
          label="Avg MRR/User"
          value={
            stats?.activeSubscriptions
              ? formatCurrency(Math.round((stats.mrrCents || 0) / stats.activeSubscriptions))
              : '$0'
          }
          isText
        />
        <QuickStatCard label="Week Growth" value={stats?.newUsersWeek || 0} suffix="users" />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendColor = 'text-green-600',
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendColor?: string
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{value}</p>
        {trend && <p className={`text-sm mt-1 ${trendColor}`}>{trend}</p>}
      </div>
    </Card>
  )
}

function GrowthItem({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-primary text-lg' : 'text-zinc-900 dark:text-white'}`}>
        {formatNumber(value)}
      </span>
    </div>
  )
}

function QuickStatCard({
  label,
  value,
  total,
  suffix,
  isText = false,
}: {
  label: string
  value: number | string
  total?: number
  suffix?: string
  isText?: boolean
}) {
  const percentage = total && typeof value === 'number' ? Math.round((value / total) * 100) : null

  return (
    <Card className="p-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-bold text-zinc-900 dark:text-white">
          {isText ? value : formatNumber(value as number)}
        </span>
        {percentage !== null && <span className="text-sm text-zinc-400">({percentage}%)</span>}
        {suffix && <span className="text-sm text-zinc-400">{suffix}</span>}
      </div>
    </Card>
  )
}

function AdminDashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 h-32 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6 h-64 animate-pulse bg-zinc-100 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  )
}
