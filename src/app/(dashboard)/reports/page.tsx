"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { fetchDeals } from "@/lib/api-client";

interface Deal {
    id: string;
    name: string;
    stage: string;
    forecast: string;
    amountMicros?: string;
    closeDate?: string;
    createdAt: string;
    owner: { id: string; fullName: string };
}

const STAGES = [
    { id: "INTAKE", label: "Intake", color: "#6b7280" },
    { id: "QUALIFIED", label: "Qualified", color: "#3b82f6" },
    { id: "DISCOVERY", label: "Discovery", color: "#8b5cf6" },
    { id: "SOLUTION_FIT", label: "Solution Fit", color: "#a855f7" },
    { id: "POV", label: "POV", color: "#ec4899" },
    { id: "PROPOSAL", label: "Proposal", color: "#f97316" },
    { id: "NEGOTIATION", label: "Negotiation", color: "#eab308" },
    { id: "COMMIT", label: "Commit", color: "#22c55e" },
    { id: "CLOSED_WON", label: "Won", color: "#10b981" },
    { id: "CLOSED_LOST", label: "Lost", color: "#ef4444" },
];

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
}

function formatCompactCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
    return `$${amount}`;
}

export default function ReportsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [quarter, setQuarter] = useState("Q1");
    const [year, setYear] = useState("2025");

    useEffect(() => {
        async function loadDeals() {
            try {
                setLoading(true);
                const res = await fetchDeals({ limit: 200 });
                setDeals(res.data || []);
            } catch (e) {
                console.error("Failed to load deals:", e);
            } finally {
                setLoading(false);
            }
        }
        loadDeals();
    }, []);

    // Calculate metrics
    const totalPipeline = deals.reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);
    const commitDeals = deals.filter(d => d.forecast === "COMMIT");
    const commitValue = commitDeals.reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);
    const bestCaseDeals = deals.filter(d => d.forecast === "BEST_CASE");
    const bestCaseValue = bestCaseDeals.reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);
    const closedWonDeals = deals.filter(d => d.stage === "CLOSED_WON");
    const closedWonValue = closedWonDeals.reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);
    const closedLostDeals = deals.filter(d => d.stage === "CLOSED_LOST");

    // Win rate
    const totalClosed = closedWonDeals.length + closedLostDeals.length;
    const winRate = totalClosed > 0 ? (closedWonDeals.length / totalClosed) * 100 : 0;

    // Stage distribution
    const stageData = STAGES.map(stage => ({
        ...stage,
        count: deals.filter(d => d.stage === stage.id).length,
        value: deals.filter(d => d.stage === stage.id).reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0),
    }));

    // Find max for scaling
    const maxStageValue = Math.max(...stageData.map(s => s.value), 1);

    // Forecast breakdown
    const forecastData = [
        { id: "COMMIT", label: "Commit", color: "#10b981", value: commitValue, count: commitDeals.length },
        { id: "BEST_CASE", label: "Best Case", color: "#3b82f6", value: bestCaseValue, count: bestCaseDeals.length },
        { id: "PIPELINE", label: "Pipeline", color: "#6b7280", value: totalPipeline - commitValue - bestCaseValue, count: deals.length - commitDeals.length - bestCaseDeals.length },
    ];

    // Rep leaderboard
    const repData = deals.reduce((acc, deal) => {
        const repName = deal.owner?.fullName || "Unassigned";
        if (!acc[repName]) {
            acc[repName] = { name: repName, pipeline: 0, commit: 0, won: 0, deals: 0 };
        }
        const amount = deal.amountMicros ? parseInt(deal.amountMicros) / 1_000_000 : 0;
        acc[repName].pipeline += amount;
        acc[repName].deals += 1;
        if (deal.forecast === "COMMIT") acc[repName].commit += amount;
        if (deal.stage === "CLOSED_WON") acc[repName].won += amount;
        return acc;
    }, {} as Record<string, { name: string; pipeline: number; commit: number; won: number; deals: number }>);

    const repLeaderboard = Object.values(repData).sort((a, b) => b.pipeline - a.pipeline);

    return (
        <>
            <style jsx global>{`
                .reports-container {
                    padding: 24px;
                    max-width: 1600px;
                    margin: 0 auto;
                }

                .reports-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }

                .period-selector {
                    display: flex;
                    gap: 8px;
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .metric-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 20px;
                }

                .metric-card.highlight {
                    border-color: var(--primary);
                    background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(99, 102, 241, 0.1) 100%);
                }

                .metric-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 8px;
                }

                .metric-value {
                    font-size: 2rem;
                    font-weight: 700;
                    font-family: monospace;
                }

                .metric-change {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    margin-top: 8px;
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                .metric-change.positive {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                }

                .metric-change.negative {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .chart-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .chart-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .chart-title {
                    font-size: 1rem;
                    font-weight: 600;
                }

                .chart-body {
                    padding: 20px;
                }

                /* Pipeline Funnel */
                .funnel-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .funnel-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .funnel-label {
                    width: 100px;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    text-align: right;
                }

                .funnel-bar-container {
                    flex: 1;
                    height: 32px;
                    background: var(--bg-tertiary);
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                }

                .funnel-bar {
                    height: 100%;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    padding: 0 12px;
                    transition: width 0.5s ease;
                }

                .funnel-bar-text {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    white-space: nowrap;
                }

                .funnel-value {
                    width: 100px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    font-family: monospace;
                    text-align: right;
                }

                .funnel-count {
                    width: 50px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-align: right;
                }

                /* Forecast Donut */
                .forecast-container {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                }

                .donut-chart {
                    width: 160px;
                    height: 160px;
                    position: relative;
                }

                .donut-center {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .donut-center-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    font-family: monospace;
                }

                .donut-center-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .forecast-legend {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }

                .legend-label {
                    flex: 1;
                    font-size: 0.875rem;
                }

                .legend-value {
                    font-weight: 600;
                    font-family: monospace;
                }

                .legend-count {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    width: 60px;
                    text-align: right;
                }

                /* Leaderboard */
                .leaderboard {
                    display: flex;
                    flex-direction: column;
                }

                .leaderboard-row {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--border);
                }

                .leaderboard-row:last-child {
                    border-bottom: none;
                }

                .leaderboard-rank {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.8rem;
                }

                .leaderboard-rank.gold {
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                    color: #1f2937;
                }

                .leaderboard-rank.silver {
                    background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
                    color: #1f2937;
                }

                .leaderboard-rank.bronze {
                    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
                    color: white;
                }

                .leaderboard-rank.default {
                    background: var(--bg-tertiary);
                    color: var(--text-muted);
                }

                .leaderboard-name {
                    flex: 1;
                    font-weight: 500;
                }

                .leaderboard-stats {
                    display: flex;
                    gap: 24px;
                }

                .leaderboard-stat {
                    text-align: right;
                }

                .leaderboard-stat-value {
                    font-weight: 600;
                    font-family: monospace;
                    font-size: 0.9rem;
                }

                .leaderboard-stat-label {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                /* Quota Progress */
                .quota-section {
                    margin-top: 24px;
                }

                .quota-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .quota-title {
                    font-size: 1rem;
                    font-weight: 600;
                }

                .quota-bar-container {
                    height: 40px;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    overflow: hidden;
                    position: relative;
                }

                .quota-bar {
                    height: 100%;
                    display: flex;
                }

                .quota-segment {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    transition: width 0.5s ease;
                }

                .quota-target {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: white;
                }

                .quota-target::after {
                    content: attr(data-label);
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                }

                .quota-legend {
                    display: flex;
                    gap: 24px;
                    margin-top: 12px;
                    justify-content: center;
                }

                .quota-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .quota-legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }

                @media (max-width: 1200px) {
                    .metrics-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>

            <Header
                title="Reports & Forecasting"
                subtitle="Pipeline analytics and revenue projections"
                actions={
                    <div className="period-selector">
                        <select className="form-input" value={quarter} onChange={(e) => setQuarter(e.target.value)} style={{ width: "auto" }}>
                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                            <option value="Q3">Q3</option>
                            <option value="Q4">Q4</option>
                        </select>
                        <select className="form-input" value={year} onChange={(e) => setYear(e.target.value)} style={{ width: "auto" }}>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                        <button className="btn btn-secondary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Export
                        </button>
                    </div>
                }
            />

            <div className="reports-container">
                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <>
                        {/* Key Metrics */}
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-label">Total Pipeline</div>
                                <div className="metric-value">{formatCurrency(totalPipeline)}</div>
                                <div className="metric-change positive">↑ 12% vs last quarter</div>
                            </div>
                            <div className="metric-card highlight">
                                <div className="metric-label">Commit Forecast</div>
                                <div className="metric-value" style={{ color: "#10b981" }}>{formatCurrency(commitValue)}</div>
                                <div className="metric-change positive">↑ 8% vs target</div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">Best Case</div>
                                <div className="metric-value" style={{ color: "#3b82f6" }}>{formatCurrency(bestCaseValue)}</div>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bestCaseDeals.length} deals</span>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">Closed Won (QTD)</div>
                                <div className="metric-value" style={{ color: "#10b981" }}>{formatCurrency(closedWonValue)}</div>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{closedWonDeals.length} deals</span>
                            </div>
                            <div className="metric-card">
                                <div className="metric-label">Win Rate</div>
                                <div className="metric-value">{winRate.toFixed(0)}%</div>
                                <div className={`metric-change ${winRate >= 30 ? "positive" : "negative"}`}>
                                    {winRate >= 30 ? "↑" : "↓"} {Math.abs(winRate - 30).toFixed(0)}% vs avg
                                </div>
                            </div>
                        </div>

                        {/* Quota Progress */}
                        <div className="chart-card" style={{ marginBottom: 24 }}>
                            <div className="chart-header">
                                <h3 className="chart-title">Quarterly Quota Progress</h3>
                                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                                    Target: <strong style={{ color: "var(--text-primary)" }}>$2.5M</strong>
                                </span>
                            </div>
                            <div className="chart-body">
                                <div className="quota-bar-container">
                                    <div className="quota-bar">
                                        <div
                                            className="quota-segment"
                                            style={{
                                                width: `${Math.min((closedWonValue / 2500000) * 100, 100)}%`,
                                                background: "#10b981",
                                            }}
                                        >
                                            {closedWonValue >= 100000 && formatCompactCurrency(closedWonValue)}
                                        </div>
                                        <div
                                            className="quota-segment"
                                            style={{
                                                width: `${Math.min((commitValue / 2500000) * 100, 100 - (closedWonValue / 2500000) * 100)}%`,
                                                background: "#22c55e",
                                            }}
                                        >
                                            {commitValue >= 100000 && formatCompactCurrency(commitValue)}
                                        </div>
                                        <div
                                            className="quota-segment"
                                            style={{
                                                width: `${Math.min((bestCaseValue / 2500000) * 100, 100 - ((closedWonValue + commitValue) / 2500000) * 100)}%`,
                                                background: "#3b82f6",
                                            }}
                                        >
                                            {bestCaseValue >= 100000 && formatCompactCurrency(bestCaseValue)}
                                        </div>
                                    </div>
                                    <div className="quota-target" style={{ left: "100%" }} data-label="$2.5M Target" />
                                </div>
                                <div className="quota-legend">
                                    <div className="quota-legend-item">
                                        <div className="quota-legend-dot" style={{ background: "#10b981" }} />
                                        Closed Won
                                    </div>
                                    <div className="quota-legend-item">
                                        <div className="quota-legend-dot" style={{ background: "#22c55e" }} />
                                        Commit
                                    </div>
                                    <div className="quota-legend-item">
                                        <div className="quota-legend-dot" style={{ background: "#3b82f6" }} />
                                        Best Case
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="charts-grid">
                            {/* Pipeline by Stage */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3 className="chart-title">Pipeline by Stage</h3>
                                </div>
                                <div className="chart-body">
                                    <div className="funnel-chart">
                                        {stageData.filter(s => !s.id.startsWith("CLOSED")).map((stage) => (
                                            <div key={stage.id} className="funnel-row">
                                                <div className="funnel-label">{stage.label}</div>
                                                <div className="funnel-bar-container">
                                                    <div
                                                        className="funnel-bar"
                                                        style={{
                                                            width: `${(stage.value / maxStageValue) * 100}%`,
                                                            background: stage.color,
                                                            minWidth: stage.value > 0 ? 60 : 0,
                                                        }}
                                                    >
                                                        {stage.value > 0 && (
                                                            <span className="funnel-bar-text">{stage.count}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="funnel-value">{formatCompactCurrency(stage.value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Forecast Breakdown */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <h3 className="chart-title">Forecast Breakdown</h3>
                                </div>
                                <div className="chart-body">
                                    <div className="forecast-container">
                                        <div className="donut-chart">
                                            <svg viewBox="0 0 100 100">
                                                {(() => {
                                                    const total = forecastData.reduce((sum, d) => sum + d.value, 0) || 1;
                                                    let cumulative = 0;
                                                    return forecastData.map((segment, idx) => {
                                                        const percentage = (segment.value / total) * 100;
                                                        const startAngle = (cumulative / 100) * 360;
                                                        cumulative += percentage;
                                                        const endAngle = (cumulative / 100) * 360;
                                                        
                                                        const startRad = (startAngle - 90) * (Math.PI / 180);
                                                        const endRad = (endAngle - 90) * (Math.PI / 180);
                                                        
                                                        const x1 = 50 + 40 * Math.cos(startRad);
                                                        const y1 = 50 + 40 * Math.sin(startRad);
                                                        const x2 = 50 + 40 * Math.cos(endRad);
                                                        const y2 = 50 + 40 * Math.sin(endRad);
                                                        
                                                        const largeArc = percentage > 50 ? 1 : 0;
                                                        
                                                        if (percentage === 0) return null;
                                                        
                                                        return (
                                                            <path
                                                                key={idx}
                                                                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                                fill={segment.color}
                                                            />
                                                        );
                                                    });
                                                })()}
                                                <circle cx="50" cy="50" r="25" fill="var(--bg-secondary)" />
                                            </svg>
                                            <div className="donut-center">
                                                <div className="donut-center-value">{formatCompactCurrency(totalPipeline)}</div>
                                                <div className="donut-center-label">Total</div>
                                            </div>
                                        </div>
                                        <div className="forecast-legend">
                                            {forecastData.map((item) => (
                                                <div key={item.id} className="legend-item">
                                                    <div className="legend-dot" style={{ background: item.color }} />
                                                    <span className="legend-label">{item.label}</span>
                                                    <span className="legend-value">{formatCompactCurrency(item.value)}</span>
                                                    <span className="legend-count">{item.count} deals</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rep Leaderboard */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">Rep Leaderboard</h3>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    Ranked by total pipeline value
                                </span>
                            </div>
                            <div className="chart-body">
                                <div className="leaderboard">
                                    {repLeaderboard.slice(0, 10).map((rep, idx) => (
                                        <div key={rep.name} className="leaderboard-row">
                                            <div className={`leaderboard-rank ${idx === 0 ? "gold" : idx === 1 ? "silver" : idx === 2 ? "bronze" : "default"}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="leaderboard-name">{rep.name}</div>
                                            <div className="leaderboard-stats">
                                                <div className="leaderboard-stat">
                                                    <div className="leaderboard-stat-value">{formatCompactCurrency(rep.pipeline)}</div>
                                                    <div className="leaderboard-stat-label">Pipeline</div>
                                                </div>
                                                <div className="leaderboard-stat">
                                                    <div className="leaderboard-stat-value" style={{ color: "#10b981" }}>{formatCompactCurrency(rep.commit)}</div>
                                                    <div className="leaderboard-stat-label">Commit</div>
                                                </div>
                                                <div className="leaderboard-stat">
                                                    <div className="leaderboard-stat-value">{formatCompactCurrency(rep.won)}</div>
                                                    <div className="leaderboard-stat-label">Won</div>
                                                </div>
                                                <div className="leaderboard-stat">
                                                    <div className="leaderboard-stat-value">{rep.deals}</div>
                                                    <div className="leaderboard-stat-label">Deals</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {repLeaderboard.length === 0 && (
                                        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 24 }}>
                                            No rep data available
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
