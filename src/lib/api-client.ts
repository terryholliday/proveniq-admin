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
    console.log("getOrgId response:", data);
    if (data.success && data.data && data.data.length > 0) {
        currentOrgId = data.data[0].id;
        return currentOrgId as string;
    }
    throw new Error("No org found");
}

export async function fetchWithOrg(url: string, options: RequestInit = {}) {
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

// ============ WOW FEATURES ============

// Tasks
export async function fetchTasks(params?: {
    status?: string;
    priority?: string;
    type?: string;
    assignedToId?: string;
    dealId?: string;
    overdue?: boolean;
    dueSoon?: boolean;
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.assignedToId) searchParams.set("assignedToId", params.assignedToId);
    if (params?.dealId) searchParams.set("dealId", params.dealId);
    if (params?.overdue) searchParams.set("overdue", "true");
    if (params?.dueSoon) searchParams.set("dueSoon", "true");
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return fetchWithOrg(`${API_BASE}/tasks?${searchParams}`);
}

export async function fetchTask(id: string) {
    return fetchWithOrg(`${API_BASE}/tasks/${id}`);
}

export async function createTask(data: {
    title: string;
    description?: string;
    type?: string;
    priority?: string;
    dueDate?: string;
    dealId?: string;
    accountId?: string;
    contactId?: string;
    assignedToId?: string;
    createdById?: string;
}) {
    return fetchWithOrg(`${API_BASE}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateTask(id: string, data: Record<string, unknown>) {
    return fetchWithOrg(`${API_BASE}/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function deleteTask(id: string) {
    return fetchWithOrg(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
    });
}

// Notifications
export async function fetchNotifications(params?: {
    userId: string;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.set("userId", params.userId);
    if (params?.unreadOnly) searchParams.set("unreadOnly", "true");
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    return fetchWithOrg(`${API_BASE}/notifications?${searchParams}`);
}

export async function createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    dealId?: string;
    taskId?: string;
    metaJson?: Record<string, unknown>;
}) {
    return fetchWithOrg(`${API_BASE}/notifications`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function markNotificationsRead(data: {
    notificationIds?: string[];
    markAllRead?: boolean;
    userId?: string;
}) {
    return fetchWithOrg(`${API_BASE}/notifications`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

// Close Plan
export async function fetchClosePlan(dealId: string) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/close-plan`);
}

export async function generateClosePlan(
    dealId: string,
    data?: {
        targetCloseDate?: string;
        items?: Array<{
            title: string;
            description?: string;
            category?: string;
            dueDate?: string;
            ownerId?: string;
        }>;
    }
) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/close-plan`, {
        method: "POST",
        body: JSON.stringify(data || {}),
    });
}

export async function updateClosePlanItem(
    dealId: string,
    data: {
        itemId: string;
        status: string;
        completedAt?: string;
    }
) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/close-plan`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

// Proof Pack
export async function fetchProofPacks(dealId: string) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/proof-pack`);
}

export async function generateProofPack(
    dealId: string,
    data?: {
        generatedById?: string;
        executiveSummary?: string;
    }
) {
    return fetchWithOrg(`${API_BASE}/deals/${dealId}/proof-pack`, {
        method: "POST",
        body: JSON.stringify(data || {}),
    });
}

// Today's Focus (aggregated dashboard data)
export async function fetchTodaysFocus(userId: string) {
    const [tasksRes, dealsRes, notificationsRes] = await Promise.all([
        fetchTasks({ assignedToId: userId, status: "TODO", limit: 100 }), // Fetch up to 100 TODO tasks
        fetchDeals({ limit: 50 }),
        fetchNotifications({ userId, unreadOnly: true, limit: 10 }),
    ]);

    const overdueTasks = tasksRes.data || [];
    const deals = dealsRes.data || [];
    const notifications = notificationsRes.data || [];

    // Calculate deals at risk (those with DRI state RED or BLACK)
    const dealsAtRisk = deals.filter(
        (d: { driScores?: Array<{ state: string }> }) =>
            d.driScores?.[0]?.state === "RED" || d.driScores?.[0]?.state === "BLACK"
    );

    // Get deals closing soon (within 14 days)
    const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const closingSoon = deals.filter(
        (d: { closeDate?: string; stage: string }) =>
            d.closeDate &&
            new Date(d.closeDate) <= twoWeeksFromNow &&
            !["CLOSED_WON", "CLOSED_LOST", "CLOSED_NO_DECISION"].includes(d.stage)
    );

    return {
        overdueTasks,
        overdueCount: overdueTasks.length,
        dealsAtRisk,
        atRiskCount: dealsAtRisk.length,
        closingSoon,
        closingSoonCount: closingSoon.length,
        notifications,
        unreadCount: notifications.length,
    };
}
