"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { fetchDeals } from "@/lib/api-client";
import Link from "next/link";

interface Deal {
    id: string;
    name: string;
    stage: string;
    forecast: string;
    amountMicros?: string;
    closeDate?: string;
    enforcementState: string;
    account: { id: string; name: string };
    owner: { id: string; fullName: string };
    driScores?: Array<{ state: string; total: number }>;
    _count?: { meddpicc: number };
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

const forecastColors: Record<string, string> = {
    PIPELINE: "badge-neutral",
    BEST_CASE: "badge-info",
    COMMIT: "badge-success",
    CLOSED: "badge-success",
    OMIT: "badge-danger",
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [stageFilter, setStageFilter] = useState("");
    const [forecastFilter, setForecastFilter] = useState("");

    useEffect(() => {
        async function loadDeals() {
            try {
                setLoading(true);
                const res = await fetchDeals({
                    stage: stageFilter || undefined,
                    forecast: forecastFilter || undefined,
                    limit: 50,
                });
                setDeals(res.data || []);
            } catch (e) {
                console.error("Failed to load deals:", e);
            } finally {
                setLoading(false);
            }
        }
        loadDeals();
    }, [stageFilter, forecastFilter]);

    const totalPipeline = deals.reduce((sum, d) => {
        const amount = d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0;
        return sum + amount;
    }, 0);

    return (
        <>
            <Header
                title="Deals"
                subtitle={`${deals.length} deals · ${formatCurrency(totalPipeline)} pipeline`}
                actions={
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Deal
                    </button>
                }
            />

            <div className="page-content">
                {/* Filters */}
                <div className="card mb-4" style={{ padding: 16 }}>
                    <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
                        <select
                            className="form-input"
                            style={{ width: "auto", minWidth: 150 }}
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                        >
                            <option value="">All Stages</option>
                            {Object.keys(stageColors).map((stage) => (
                                <option key={stage} value={stage}>
                                    {stage.replace(/_/g, " ")}
                                </option>
                            ))}
                        </select>

                        <select
                            className="form-input"
                            style={{ width: "auto", minWidth: 150 }}
                            value={forecastFilter}
                            onChange={(e) => setForecastFilter(e.target.value)}
                        >
                            <option value="">All Forecasts</option>
                            <option value="PIPELINE">Pipeline</option>
                            <option value="BEST_CASE">Best Case</option>
                            <option value="COMMIT">Commit</option>
                        </select>
                    </div>
                </div>

                {/* Deals Table */}
                <div className="card">
                    {loading ? (
                        <div className="flex items-center justify-center" style={{ padding: 48 }}>
                            <div className="loading-spinner" />
                        </div>
                    ) : deals.length === 0 ? (
                        <div className="empty-state">
                            <p>No deals found</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Deal</th>
                                        <th>Account</th>
                                        <th>Stage</th>
                                        <th>Forecast</th>
                                        <th>Amount</th>
                                        <th>Close</th>
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
                                                    {deal.enforcementState === "FROZEN" && (
                                                        <span className="badge badge-danger" style={{ marginLeft: 8, fontSize: "0.65rem" }}>
                                                            FROZEN
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-secondary">{deal.account?.name || "-"}</td>
                                                <td>
                                                    <span className={`badge ${stageColors[deal.stage] || "badge-neutral"}`}>
                                                        {deal.stage}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${forecastColors[deal.forecast] || "badge-neutral"}`}>
                                                        {deal.forecast.replace(/_/g, " ")}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600, fontFamily: "monospace" }}>
                                                    {formatCurrency(amount)}
                                                </td>
                                                <td className="text-secondary">
                                                    {deal.closeDate ? formatDate(deal.closeDate) : "-"}
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`dri-indicator dri-${driState}`} />
                                                        {latestDri && (
                                                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                                {latestDri.total}
                                                            </span>
                                                        )}
                                                    </div>
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
            </div>
        </>
    );
}
