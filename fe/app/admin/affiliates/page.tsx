"use client";

import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  ExternalLink,
  Percent,
  RefreshCw,
  Search,
  Users2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdminAffiliates,
  useAffiliateSettings,
} from "@/hooks/queries/admin";
import { formatCurrency } from "@/lib/formatUtils";
import type { AdminAffiliateListParams, AffiliateStatus } from "@/types/admin";

export default function AdminAffiliatesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | "">("");

  const params: AdminAffiliateListParams = {
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  };

  const { data, isLoading, refetch } = useAdminAffiliates(params);
  const { data: settingsData, isLoading: settingsLoading } =
    useAffiliateSettings();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-zinc-900 dark:text-white">
            Affiliate Program
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            View affiliates and program settings. Manage affiliates in Lemon
            Squeezy.
          </p>
        </div>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/40">
              <Percent className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Commission Rate
              </p>
              <p className="font-bold text-2xl text-zinc-900 dark:text-white">
                {settingsLoading
                  ? "—"
                  : `${settingsData?.settings.commissionRate}%`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-blue-900/30 dark:from-blue-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/40">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Tracking Length
              </p>
              <p className="font-bold text-2xl text-zinc-900 dark:text-white">
                {settingsLoading
                  ? "—"
                  : `${settingsData?.settings.trackingLength} days`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 dark:border-amber-900/30 dark:from-amber-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 dark:bg-amber-900/40">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Minimum Payout
              </p>
              <p className="font-bold text-2xl text-zinc-900 dark:text-white">
                {settingsLoading
                  ? "—"
                  : formatCurrency(settingsData?.settings.minimumPayout ?? 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 dark:border-violet-900/30 dark:from-violet-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5 dark:bg-violet-900/40">
              <Users2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Affiliates
              </p>
              <p className="font-bold text-2xl text-zinc-900 dark:text-white">
                {isLoading ? "—" : (data?.total ?? 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {settingsData?.dashboardUrls.affiliatesOverview && (
              <Button asChild size="sm" variant="outline">
                <a
                  href={settingsData.dashboardUrls.affiliatesOverview}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View in Lemon Squeezy
                </a>
              </Button>
            )}
            {settingsData?.dashboardUrls.payouts && (
              <Button asChild size="sm" variant="outline">
                <a
                  href={settingsData.dashboardUrls.payouts}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Manage Payouts
                </a>
              </Button>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Affiliate management is handled in Lemon Squeezy dashboard
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-48 flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-zinc-400" />
            <Input
              className="pl-10"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              value={search}
            />
          </div>
          <select
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            onChange={(e) => {
              setStatusFilter(e.target.value as AffiliateStatus | "");
              setPage(1);
            }}
            value={statusFilter}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-zinc-200 border-b dark:border-zinc-700">
                  <tr>
                    <th className="p-4 text-left font-medium text-zinc-500 dark:text-zinc-400">
                      Affiliate
                    </th>
                    <th className="p-4 text-left font-medium text-zinc-500 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="p-4 text-left font-medium text-zinc-500 dark:text-zinc-400">
                      Total Earnings
                    </th>
                    <th className="p-4 text-left font-medium text-zinc-500 dark:text-zinc-400">
                      Unpaid Earnings
                    </th>
                    <th className="p-4 text-left font-medium text-zinc-500 dark:text-zinc-400">
                      Share Domain
                    </th>
                    <th className="p-4 text-left font-medium text-zinc-500 dark:text-zinc-400">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.affiliates.map((affiliate) => (
                    <tr
                      className="border-zinc-100 border-b hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                      key={affiliate.id}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                            <span className="font-medium text-sm text-zinc-600 dark:text-zinc-300">
                              {affiliate.userName?.[0]?.toUpperCase() ||
                                affiliate.userEmail[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {affiliate.userName ||
                                affiliate.userEmail.split("@")[0]}
                            </p>
                            <p className="text-sm text-zinc-500">
                              {affiliate.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={affiliate.status} />
                      </td>
                      <td className="p-4 font-medium text-sm text-zinc-900 dark:text-white">
                        {formatCurrency(affiliate.totalEarnings)}
                      </td>
                      <td className="p-4 font-medium text-sm text-zinc-900 dark:text-white">
                        {formatCurrency(affiliate.unpaidEarnings)}
                      </td>
                      <td className="p-4">
                        <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {affiliate.shareDomain}
                        </code>
                      </td>
                      <td className="p-4 text-sm text-zinc-500">
                        {format(new Date(affiliate.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                  {data?.affiliates.length === 0 && (
                    <tr>
                      <td
                        className="p-8 text-center text-zinc-500 dark:text-zinc-400"
                        colSpan={6}
                      >
                        No affiliates found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-zinc-200 border-t p-4 dark:border-zinc-700">
              <p className="text-sm text-zinc-500">
                Showing {data?.affiliates.length || 0} of {data?.total || 0}{" "}
                affiliates
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  size="sm"
                  variant="outline"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  disabled={page >= (data?.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  size="sm"
                  variant="outline"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: AffiliateStatus }) {
  const variants: Record<AffiliateStatus, string> = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    disabled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return <Badge className={variants[status]}>{status}</Badge>;
}
