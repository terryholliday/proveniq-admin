// API client for fetching data from the backend
// All requests include orgId header for multi-tenancy

const API_BASE = "/api";

// Default org ID (from seed) - in real app, this comes from auth context
let currentOrgId: string | null = null;

export async function setOrgId(orgId: string) {
    currentOrgId = orgId;
}

export async function getOrgId(): Promise<string> {
    if (currentOrgId) return currentOrgId;

    // Fetch first org if not set
    const res = await fetch(`${API_BASE}/orgs`);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
        currentOrgId = data.data[0].id;
        return currentOrgId as string;
    }
    throw new Error("No org found");
}

async function fetchWithOrg(url: string, options: RequestInit = {}) {
    const orgId = await getOrgId();
    const headers = {
        "Content-Type": "application/json",
        "x-org-id": orgId,
        ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!data.success) {
        throw new Error(data.error || "API error");
    }

    return data;
}

// Orgs
export async function fetchOrgs() {
    const res = await fetch(`${API_BASE}/orgs`);
    return res.json();
}

// Deals
export async function fetchDeals(params?: {
    stage?: string;
    forecast?: string;
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params?.stage) searchParams.set("stage", params.stage);
    if (params?.forecast) searchParams.set("forecast", params.forecast);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return fetchWithOrg(`${API_BASE}/deals?${searchParams}`);
}

export async function fetchDeal(id: string) {
    return fetchWithOrg(`${API_BASE}/deals/${id}`);
}

export async function updateDeal(id: string, data: Record<string, unknown>) {
    return fetchWithOrg(`${API_BASE}/deals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

// MEDDPICC
export async function fetchMeddpicc(dealId: string) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/meddpicc`);
}

export async function updateMeddpicc(dealId: string, data: Record<string, unknown>) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/meddpicc`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// Accounts
export async function fetchAccounts(params?: {
    segment?: string;
    search?: string;
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params?.segment) searchParams.set("segment", params.segment);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return fetchWithOrg(`${API_BASE}/accounts?${searchParams}`);
}

// Users
export async function fetchUsers() {
    return fetchWithOrg(`${API_BASE}/users`);
}

// Enforcement
export async function fetchEnforcement(dealId: string) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/enforcement`);
}

// Stats summary (computed client-side from deals)
export async function fetchDashboardStats() {
    const dealsRes = await fetchDeals({ limit: 100 });
    const deals = dealsRes.data || [];

    const totalPipeline = deals.reduce((sum: number, d: { amountMicros?: string }) => {
        const amount = d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0;
        return sum + amount;
    }, 0);

    const commitDeals = deals.filter((d: { forecast: string }) => d.forecast === "COMMIT");
    const commitValue = commitDeals.reduce((sum: number, d: { amountMicros?: string }) => {
        const amount = d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0;
        return sum + amount;
    }, 0);

    return {
        totalPipeline,
        activeDeals: deals.length,
        commitForecast: commitValue,
        commitCount: commitDeals.length,
    };
}
