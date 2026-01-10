'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  Bell,
  Info,
  ChevronDown,
} from 'lucide-react'
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  useDashboardStats,
  useSubscriptionDistribution,
  useRecentPayments,
  useRevenueTrends,
  useSubscriptionTrends,
  useAdminMe,
} from '@/hooks/queries/admin'
import { formatCurrency, formatNumber } from '@/services/admin.service'
import { cn } from '@/lib/utils'

// Helper to generate sparkline data from trends
const generateSparklineFromTrends = (
  data: { revenue?: number; subscriptions?: number }[] | undefined,
  key: 'revenue' | 'subscriptions'
): { value: number }[] => {
  if (!data || data.length === 0) {
    return Array(7).fill({ value: 0 })
  }
  return data.map((item) => ({ value: item[key] || 0 }))
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: distribution, isLoading: distLoading } = useSubscriptionDistribution()
  const { data: recentPayments } = useRecentPayments({ limit: 5 })
  const { data: revenueTrends } = useRevenueTrends(6)
  const { data: subscriptionTrends } = useSubscriptionTrends(7)
  const { data: adminUser } = useAdminMe()

  // Transform revenue trends for sales activity chart
  const salesActivityData = (revenueTrends || []).map((item) => ({
    month: item.month,
    revenue: item.revenue,
    subscriptions: item.subscriptions,
  }))

  // Transform subscription trends for the bar chart
  const subscriptionChartData = (subscriptionTrends || []).map((item) => ({
    name: item.date,
    newSubs: item.newSubscriptions,
    totalActive: item.totalActive,
  }))

  // Generate sparkline data from revenue trends
  const revenueSparkline = generateSparklineFromTrends(revenueTrends, 'revenue')
  const subsSparkline = generateSparklineFromTrends(revenueTrends, 'subscriptions')

  if (statsLoading || distLoading) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="mb-2 flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Pick a date
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2" disabled>
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2" disabled>
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid auto-rows-auto grid-cols-3 gap-5 md:grid-cols-6 lg:grid-cols-9">
            {/* Stat Cards with Sparklines */}
            <StatCardWithSparkline
              title="Active Subscriptions"
              value={formatNumber(stats?.activeSubscriptions || 0)}
              subtitle="Total active"
              trend={stats?.activeSubscriptions && stats?.totalUsers ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}
              trendUp={true}
              data={subsSparkline}
              color="var(--chart-1)"
            />
            <StatCardWithSparkline
              title="New Users This Week"
              value={formatNumber(stats?.newUsersWeek || 0)}
              subtitle="Since last week"
              trend={stats?.newUsersWeek && stats?.newUsersMonth ? Math.round((stats.newUsersWeek / stats.newUsersMonth) * 100) : 0}
              trendUp={(stats?.newUsersWeek || 0) > 0}
              data={revenueSparkline}
              color="var(--chart-2)"
            />
            <StatCardWithSparkline
              title="Active Users"
              value={formatNumber(stats?.activeUsers || 0)}
              subtitle="Total active"
              trend={stats?.activeUsers && stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}
              trendUp={true}
              data={subsSparkline}
              color="#6366f1"
            />

            {/* Total Revenue Card */}
            <div className="col-span-3">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-normal">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%_-_52px)] pb-0">
                  <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenueCents || 0)}</div>
                  <p className="text-xs text-muted-foreground">MRR: {formatCurrency(stats?.mrrCents || 0)}</p>
                  <div className="h-[80px] w-full mt-4">
                    <ChartContainer
                      config={{
                        revenue: { label: 'Revenue', color: 'var(--primary)' },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesActivityData}>
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue & Subscriptions Chart */}
            <div className="col-span-3 md:col-span-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Revenue & Subscriptions - Monthly</CardTitle>
                  <CardDescription>Showing revenue and new subscriptions for the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%_-_90px)]">
                  <ChartContainer
                    config={{
                      revenue: { label: 'Revenue ($)', color: 'var(--chart-1)' },
                      subscriptions: { label: 'Subscriptions', color: 'var(--chart-2)' },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesActivityData}>
                        <defs>
                          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="fillSubscriptions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-subscriptions)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-subscriptions)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="subscriptions"
                          stroke="var(--color-subscriptions)"
                          fill="url(#fillSubscriptions)"
                          fillOpacity={0.4}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-revenue)"
                          fill="url(#fillRevenue)"
                          fillOpacity={0.4}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Subscriptions Chart */}
            <div className="col-span-3 md:col-span-6 lg:col-span-3">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-normal">Subscription Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="text-2xl font-bold">{formatNumber(stats?.activeSubscriptions || 0)}</div>
                  <p className="text-xs text-muted-foreground">Active subscriptions (last 7 days)</p>
                  <div className="mt-6 h-[calc(100%_-_120px)] max-h-[205px] w-full">
                    <ChartContainer
                      config={{
                        newSubs: { label: 'New', color: 'var(--chart-1)' },
                        totalActive: { label: 'Total Active', color: 'var(--chart-2)' },
                      }}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subscriptionChartData}>
                          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="newSubs" fill="var(--color-newSubs)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="totalActive" fill="var(--color-totalActive)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payments Table */}
            <div className="col-span-3 md:col-span-6 lg:col-span-5 xl:col-span-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Payments</CardTitle>
                  <CardDescription>Manage your payments.</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%_-_102px)]">
                  <div className="mb-4 flex items-center gap-4">
                    <input
                      className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Filter emails..."
                    />
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-[calc(100%_-_52px)] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <input type="checkbox" className="h-4 w-4 rounded border" />
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentPayments && recentPayments.length > 0 ? (
                          recentPayments.slice(0, 4).map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <input type="checkbox" className="h-4 w-4 rounded border" />
                              </TableCell>
                              <TableCell>
                                <span className="capitalize">{payment.status}</span>
                              </TableCell>
                              <TableCell className="lowercase">{payment.email}</TableCell>
                              <TableCell className="text-right font-medium">
                                ${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : payment.amount}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  ...
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                              No recent payments
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin User Info */}
            <div className="col-span-3 md:col-span-6 lg:col-span-4 xl:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Admin</CardTitle>
                  <CardDescription className="truncate">
                    Currently logged in administrator
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {adminUser ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={adminUser.avatar_url || ''} alt={adminUser.display_name || adminUser.email} />
                          <AvatarFallback>
                            {(adminUser.display_name || adminUser.first_name || adminUser.email)
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {adminUser.display_name || `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() || 'Admin'}
                          </p>
                          <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {adminUser.role}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex h-20 items-center justify-center">
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{adminUser?.status || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timezone</p>
                        <p className="font-medium">{adminUser?.timezone || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Member since</p>
                        <p className="font-medium">
                          {adminUser?.created_at
                            ? new Date(adminUser.created_at).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email verified</p>
                        <p className="font-medium">{adminUser?.email_verified ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTabContent stats={stats} distribution={distribution} />
        </TabsContent>

        {/* Reports Tab - Placeholder */}
        <TabsContent value="reports" className="space-y-4">
          <PlaceholderContent
            title="Reports"
            description="Generate and view detailed reports about your business metrics."
            icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          />
        </TabsContent>

        {/* Notifications Tab - Placeholder */}
        <TabsContent value="notifications" className="space-y-4">
          <PlaceholderContent
            title="Notifications"
            description="Manage your notification preferences and view recent alerts."
            icon={<Bell className="h-12 w-12 text-muted-foreground" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Stat Card with Sparkline Component
function StatCardWithSparkline({
  title,
  value,
  subtitle,
  trend,
  trendUp,
  data,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  trend: number
  trendUp: boolean
  data: { value: number }[]
  color: string
}) {
  return (
    <Card className="col-span-3 h-full lg:col-span-2 xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between gap-5 space-y-0 pb-2 pt-4">
        <CardTitle className="flex items-center gap-2 truncate text-sm font-medium">
          <CreditCard className="h-4 w-4" />
          {title}
        </CardTitle>
        <button className="text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
          <span className="sr-only">More Info</span>
        </button>
      </CardHeader>
      <CardContent className="flex h-[calc(100%_-_48px)] flex-col justify-between py-4">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="text-3xl font-bold">{value}</div>
            <div className="w-[70px]">
              <ChartContainer
                config={{ month: { label: 'Value', color } }}
                className="h-[40px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="text-sm font-semibold">Details</div>
          <div
            className={cn(
              'flex items-center gap-1',
              trendUp ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
            )}
          >
            <p className="text-[13px] font-medium leading-none">{trend}%</p>
            {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Analytics Tab Content
function AnalyticsTabContent({
  stats,
  distribution,
}: {
  stats: ReturnType<typeof useDashboardStats>['data']
  distribution: ReturnType<typeof useSubscriptionDistribution>['data']
}) {
  return (
    <div className="grid auto-rows-auto grid-cols-6 gap-5">
      {/* User Growth Chart */}
      <div className="col-span-6 xl:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Today</span>
                <span className="font-semibold">{formatNumber(stats?.newUsersToday || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New This Week</span>
                <span className="font-semibold">{formatNumber(stats?.newUsersWeek || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New This Month</span>
                <span className="font-semibold">{formatNumber(stats?.newUsersMonth || 0)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-lg font-bold text-primary">{formatNumber(stats?.activeUsers || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Distribution */}
      <div className="col-span-6 xl:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Subscription Distribution</CardTitle>
            <CardDescription>Breakdown by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution && distribution.length > 0 ? (
                distribution.map((plan) => (
                  <div key={plan.planSlug} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full',
                          plan.planSlug === 'executive'
                            ? 'bg-amber-500'
                            : plan.planSlug === 'pro'
                              ? 'bg-primary'
                              : 'bg-zinc-400'
                        )}
                      />
                      <span className="text-sm text-muted-foreground">{plan.planName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{plan.subscriberCount}</span>
                      <span className="text-sm text-muted-foreground">({plan.percentage}%)</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-muted-foreground">No subscription data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="col-span-6 lg:col-span-3 xl:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Revenue Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly Recurring</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(stats?.mrrCents || 0)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(stats?.totalRevenueCents || 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <div className="col-span-6 lg:col-span-3 xl:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Users</p>
              <p className="mt-1 text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Rate</p>
              <p className="mt-1 text-2xl font-bold">
                {stats?.totalUsers ? Math.round(((stats.activeUsers || 0) / stats.totalUsers) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate */}
      <div className="col-span-6 lg:col-span-3 xl:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Paid Conversion</p>
              <p className="mt-1 text-2xl font-bold">
                {stats?.totalUsers ? Math.round(((stats.activeSubscriptions || 0) / stats.totalUsers) * 100) : 0}%
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Revenue/User</p>
              <p className="mt-1 text-2xl font-bold">
                {stats?.activeSubscriptions
                  ? formatCurrency(Math.round((stats.mrrCents || 0) / stats.activeSubscriptions))
                  : '$0'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Placeholder Component for unsupported features
function PlaceholderContent({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card className="flex h-[400px] flex-col items-center justify-center">
      <CardContent className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-muted p-4">{icon}</div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="max-w-md text-muted-foreground">{description}</p>
        <Badge variant="secondary" className="mt-4">
          Coming Soon
        </Badge>
      </CardContent>
    </Card>
  )
}

// Skeleton Component
function AdminDashboardSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="mb-2 flex flex-col items-start justify-between space-y-2 md:flex-row md:items-center">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center space-x-2">
          <div className="h-9 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="h-9 w-96 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-zinc-100 p-6 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-64 animate-pulse bg-zinc-100 p-6 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  )
}
