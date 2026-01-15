import { env } from "@/config";
import { initializeLemonSqueezy } from "@/config/clients/lemonsqueezy";

const LEMONSQUEEZY_API_BASE = "https://api.lemonsqueezy.com/v1";

export type AffiliateStatus = "active" | "pending" | "disabled";

export type LemonSqueezyAffiliateAttributes = {
  store_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  share_domain: string;
  status: AffiliateStatus;
  application_note: string | null;
  products: string[] | null;
  total_earnings: number;
  unpaid_earnings: number;
  created_at: string;
  updated_at: string;
};

export type LemonSqueezyAffiliate = {
  type: "affiliates";
  id: string;
  attributes: LemonSqueezyAffiliateAttributes;
};

export type AdminAffiliate = {
  id: string;
  userName: string;
  userEmail: string;
  status: AffiliateStatus;
  applicationNote: string | null;
  totalEarnings: number;
  unpaidEarnings: number;
  shareDomain: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminAffiliateListParams = {
  page?: number;
  limit?: number;
  status?: AffiliateStatus;
  search?: string;
};

export type AdminAffiliateListResponse = {
  affiliates: AdminAffiliate[];
  total: number;
  page: number;
  totalPages: number;
};

export type AffiliateProgramSettings = {
  affiliateHubUrl: string;
  commissionRate: number;
  trackingLength: number;
  minimumPayout: number;
  autoApproval: boolean;
  subscriptionCommission: boolean;
};

export type AffiliateDashboardUrls = {
  affiliatesOverview: string;
  affiliateSettings: string;
  payouts: string;
};

type LemonSqueezyListResponse = {
  data: LemonSqueezyAffiliate[];
  meta: {
    page: {
      currentPage: number;
      from: number;
      lastPage: number;
      perPage: number;
      to: number;
      total: number;
    };
  };
};

const fetchFromLemonSqueezy = async <T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> => {
  const url = new URL(`${LEMONSQUEEZY_API_BASE}${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${env.lemonSqueezy.apiKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Lemon Squeezy API error: ${response.status} - ${error}`);
  }

  return response.json();
};

const mapAffiliateToAdmin = (
  affiliate: LemonSqueezyAffiliate
): AdminAffiliate => ({
  id: affiliate.id,
  userName: affiliate.attributes.user_name,
  userEmail: affiliate.attributes.user_email,
  status: affiliate.attributes.status,
  applicationNote: affiliate.attributes.application_note,
  totalEarnings: affiliate.attributes.total_earnings,
  unpaidEarnings: affiliate.attributes.unpaid_earnings,
  shareDomain: affiliate.attributes.share_domain,
  createdAt: affiliate.attributes.created_at,
  updatedAt: affiliate.attributes.updated_at,
});

export const getAffiliateList = async (
  params: AdminAffiliateListParams
): Promise<AdminAffiliateListResponse> => {
  initializeLemonSqueezy();

  if (!env.lemonSqueezy.storeId) {
    throw new Error("Lemon Squeezy store ID not configured");
  }

  const queryParams: Record<string, string> = {
    "filter[store_id]": env.lemonSqueezy.storeId,
  };

  if (params.page) {
    queryParams["page[number]"] = String(params.page);
  }
  if (params.limit) {
    queryParams["page[size]"] = String(params.limit);
  }
  if (params.search) {
    queryParams["filter[user_email]"] = params.search;
  }

  const response = await fetchFromLemonSqueezy<LemonSqueezyListResponse>(
    "/affiliates",
    queryParams
  );

  let affiliates = response.data.map(mapAffiliateToAdmin);

  if (params.status) {
    affiliates = affiliates.filter((a) => a.status === params.status);
  }

  return {
    affiliates,
    total: response.meta.page.total,
    page: response.meta.page.currentPage,
    totalPages: response.meta.page.lastPage,
  };
};

export const getAffiliateById = async (
  id: string
): Promise<AdminAffiliate | null> => {
  initializeLemonSqueezy();

  try {
    const response = await fetchFromLemonSqueezy<{
      data: LemonSqueezyAffiliate;
    }>(`/affiliates/${id}`);
    return mapAffiliateToAdmin(response.data);
  } catch (error) {
    console.error("Failed to fetch affiliate:", error);
    return null;
  }
};

export const getAffiliateProgramSettings = (): AffiliateProgramSettings => ({
  affiliateHubUrl: "https://store.askally.io/affiliates",
  commissionRate: 20,
  trackingLength: 7,
  minimumPayout: 1000,
  autoApproval: false,
  subscriptionCommission: true,
});

export const getAffiliateDashboardUrls = (): AffiliateDashboardUrls => ({
  affiliatesOverview: "https://app.lemonsqueezy.com/affiliates",
  affiliateSettings: "https://app.lemonsqueezy.com/settings/affiliates",
  payouts: "https://app.lemonsqueezy.com/affiliates/payouts",
});
