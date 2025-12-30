"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import TodaysFocus from "@/components/TodaysFocus";
import { fetchDeals, fetchDashboardStats } from "@/lib/api-client";
import Link from "next/link";

interface Deal {
    id: string;
    name: string;
    stage: string;
    forecast: string;
    amountMicros?: string;
    owner: { id: string; fullName: string };
    driScores?: Array<{ state: string; total: number }>;
}

interface Stats {
    totalPipeline: number;
    activeDeals: number;
    commitForecast: number;
    commitCount: number;
}

const stageColors: Record<string, string> = {
    INTAKE: "stage-intake",
    QUALIFIED: "stage-qualified",
    DISCOVERY: "stage-discovery",
    SOLUTION_FIT: "stage-solution-fit",
    POV: "stage-pov",
    PROPOSAL: "stage-proposal",
    LEGAL: "stage-legal",
    PROCUREMENT: "stage-procurement",
    COMMIT: "stage-commit",
    CLOSED_WON: "stage-closed-won",
    CLOSED_LOST: "stage-closed-lost",
};

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `$${(amount / 1_000).toFixed(0)}K`;
}

export default function DashboardPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        async function loadData() {
            try {
                // Dynamically import to avoid server-side issues if any
                const { fetchDeals, fetchDashboardStats, fetchUsers } = await import("@/lib/api-client");

                const [dealsRes, statsRes, usersRes] = await Promise.all([
                    fetchDeals({ limit: 10 }),
                    fetchDashboardStats(),
                    fetchUsers()
                ]);

                setDeals(dealsRes.data || []);
                setStats(statsRes);

                // For this Admin MVP, we assume the first user is the active one
                // In a real app, this would come from the auth session
                if (usersRes.data && usersRes.data.length > 0) {
                    setCurrentUserId(usersRes.data[0].id);
                }
            } catch (e) {
                console.error("Failed to load dashboard:", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <>
                <Header title="Dashboard" subtitle="Loading..." />
                <div className="page-content flex items-center justify-center" style={{ minHeight: 400 }}>
                    <div className="loading-spinner" />
                </div>
            </>
        );
    }

    return (
        <>
            <Header title="Dashboard" subtitle="Pipeline overview and key metrics" />

            <div className="page-content">
                {/* Today's Focus Cockpit */}
                <div className="mb-6">
                    <TodaysFocus demoMode={false} userId={currentUserId} />
                </div>

                {/* Stats Grid */}
                <div className="stats-grid mb-6">
                    <div className="stat-card">
                        <div className="stat-value">{stats ? formatCurrency(stats.totalPipeline) : "-"}</div>
                        <div className="stat-label">Total Pipeline</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats?.activeDeals || 0}</div>
                        <div className="stat-label">Active Deals</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats ? formatCurrency(stats.commitForecast) : "-"}</div>
                        <div className="stat-label">Commit Forecast</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats?.commitCount || 0}</div>
                        <div className="stat-label">Commit Deals</div>
                    </div>
                </div>

                {/* Recent Deals */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Deals</h3>
                        <Link href="/deals" className="btn btn-ghost btn-sm">
                            View all →
                        </Link>
                    </div>

                    {deals.length === 0 ? (
                        <div className="empty-state">
                            <p>No deals found</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Deal</th>
                                        <th>Stage</th>
                                        <th>Amount</th>
                                        <th>DRI</th>
                                        <th>Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deals.map((deal) => {
                                        const amount = deal.amountMicros
                                            ? parseInt(deal.amountMicros) / 1_000_000
                                            : 0;
                                        const latestDri = deal.driScores?.[0];
                                        const driState = latestDri?.state?.toLowerCase() || "black";

                                        return (
                                            <tr key={deal.id}>
                                                <td>
                                                    <Link
                                                        href={`/deals/${deal.id}`}
                                                        style={{ color: "var(--primary-light)", fontWeight: 500 }}
                                                    >
                                                        {deal.name}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <span className={`badge ${stageColors[deal.stage] || "badge-neutral"}`}>
                                                        {deal.stage}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 500 }}>{formatCurrency(amount)}</td>
                                                <td>
                                                    <div className={`dri-indicator dri-${driState}`} />
                                                </td>
                                                <td className="text-secondary">{deal.owner?.fullName || "-"}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pipeline by Stage */}
                <div className="card mt-6">
                    <div className="card-header">
                        <h3 className="card-title">Pipeline by Stage</h3>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.keys(stageColors).slice(0, 10).map((stage) => {
                            const count = deals.filter((d) => d.stage === stage).length;
                            return (
                                <div
                                    key={stage}
                                    style={{
                                        padding: "12px 16px",
                                        background: "var(--bg-tertiary)",
                                        borderRadius: "var(--radius-md)",
                                        minWidth: 120,
                                    }}
                                >
                                    <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{count}</div>
                                    <div
                                        className={stageColors[stage]}
                                        style={{ fontSize: "0.75rem", marginTop: 4 }}
                                    >
                                        {stage.replace(/_/g, " ")}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
