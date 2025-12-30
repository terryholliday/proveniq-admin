"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import ClosePlanPanel from "@/components/ClosePlanPanel";
import ProofPackPanel from "@/components/ProofPackPanel";

interface Deal {
    id: string;
    name: string;
    stage: string;
    forecast: string;
    amountMicros: string | null;
    termMonths: number | null;
    closeDate: string | null;
    enforcementState: string;
    productMix: string[];
    createdAt: string;
    updatedAt: string;
    account: {
        id: string;
        name: string;
        domain: string | null;
        segment: string;
    };
    owner: {
        id: string;
        fullName: string;
        email: string;
    } | null;
    se: {
        id: string;
        fullName: string;
    } | null;
    stakeholders: Array<{
        id: string;
        roleInDeal: string;
        contact: {
            id: string;
            name: string;
            email: string | null;
            title: string | null;
            phone: string | null;
        };
    }>;
    meddpicc: Array<{
        id: string;
        category: string;
        status: string;
        notes: string | null;
    }>;
    driScores: Array<{
        id: string;
        state: string;
        total: number;
        createdAt: string;
    }>;
    activities: Array<{
        id: string;
        type: string;
        summary: string | null;
        occurredAt: string;
    }>;
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

const MEDDPICC_LABELS: Record<string, { full: string; weight: number }> = {
    METRICS: { full: "Metrics", weight: 15 },
    ECONOMIC_BUYER: { full: "Economic Buyer", weight: 15 },
    DECISION_CRITERIA: { full: "Decision Criteria", weight: 10 },
    DECISION_PROCESS: { full: "Decision Process", weight: 10 },
    PAPER_PROCESS: { full: "Paper Process", weight: 10 },
    IDENTIFY_PAIN: { full: "Identify Pain", weight: 15 },
    CHAMPION: { full: "Champion", weight: 15 },
    COMPETITION: { full: "Competition", weight: 10 },
};

const ACTIVITY_ICONS: Record<string, { icon: string; color: string }> = {
    CALL: { icon: "📞", color: "#3b82f6" },
    EMAIL: { icon: "✉️", color: "#8b5cf6" },
    MEETING: { icon: "👥", color: "#10b981" },
    NOTE: { icon: "📝", color: "#f59e0b" },
    TASK: { icon: "✓", color: "#6366f1" },
    STAGE_CHANGE: { icon: "→", color: "#ec4899" },
    CREATED: { icon: "✨", color: "#22c55e" },
};

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
}

function getDriColor(state: string): string {
    switch (state?.toUpperCase()) {
        case "GREEN": return "#10b981";
        case "YELLOW": return "#eab308";
        case "RED": return "#ef4444";
        default: return "#374151";
    }
}

function getStatusColor(status: string): string {
    switch (status) {
        case "BUYER_CONFIRMED": return "#10b981";
        case "EVIDENCED": return "#3b82f6";
        case "CLAIMED": return "#f59e0b";
        default: return "#ef4444";
    }
}

export default function DealDetailClient({ deal }: { deal: Deal }) {
    const [activeTab, setActiveTab] = useState<"overview" | "activity" | "stakeholders" | "meddpicc" | "documents" | "closeplan" | "proofpack">("overview");
    const [showLogActivity, setShowLogActivity] = useState(false);

    const amount = deal.amountMicros ? parseInt(deal.amountMicros) / 1_000_000 : 0;
    const latestDri = deal.driScores[0];
    const driState = latestDri?.state?.toLowerCase() || "black";
    const driScore = latestDri?.total || 0;
    const currentStageIndex = STAGES.findIndex(s => s.id === deal.stage);
    const isFrozen = deal.enforcementState === "FROZEN";

    // Calculate MEDDPICC score
    const meddpiccScore = deal.meddpicc.reduce((total, item) => {
        const weight = MEDDPICC_LABELS[item.category]?.weight || 0;
        let multiplier = 0;
        switch (item.status) {
            case "BUYER_CONFIRMED": multiplier = 1; break;
            case "EVIDENCED": multiplier = 0.75; break;
            case "CLAIMED": multiplier = 0.5; break;
            default: multiplier = 0;
        }
        return total + (weight * multiplier);
    }, 0);

    return (
        <>
            <style jsx global>{`
                .deal-hero {
                    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
                    border-bottom: 1px solid var(--border);
                    padding: 24px;
                }

                .deal-hero-content {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .deal-title-row {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }

                .deal-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .frozen-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 6px;
                    color: #ef4444;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .deal-subtitle {
                    font-size: 1rem;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }

                .deal-actions {
                    display: flex;
                    gap: 12px;
                }

                .stage-progress {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-bottom: 24px;
                    overflow-x: auto;
                    padding: 4px 0;
                }

                .stage-step {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .stage-dot {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.7rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }

                .stage-dot.completed {
                    background: var(--success);
                    color: white;
                }

                .stage-dot.current {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
                }

                .stage-dot.future {
                    background: var(--bg-tertiary);
                    color: var(--text-muted);
                    border: 2px solid var(--border);
                }

                .stage-line {
                    width: 24px;
                    height: 2px;
                    background: var(--border);
                }

                .stage-line.completed {
                    background: var(--success);
                }

                .stage-label {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                }

                .stage-label.current {
                    color: var(--primary-light);
                    font-weight: 600;
                }

                .metrics-row {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                }

                .metric-card {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                }

                .metric-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 6px;
                }

                .metric-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .metric-value.currency {
                    font-family: monospace;
                }

                /* Tabs */
                .tabs-container {
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border);
                    padding: 0 24px;
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .tabs {
                    display: flex;
                    gap: 0;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .tab {
                    padding: 16px 24px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .tab:hover {
                    color: var(--text-primary);
                }

                .tab.active {
                    color: var(--primary-light);
                    border-bottom-color: var(--primary);
                }

                .tab-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    margin-left: 8px;
                    background: var(--bg-tertiary);
                    border-radius: 10px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                /* Content Area */
                .deal-content {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 24px;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }

                .content-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                }

                .card-title {
                    font-size: 1rem;
                    font-weight: 600;
                }

                .card-body {
                    padding: 20px;
                }

                /* Activity Timeline */
                .timeline {
                    display: flex;
                    flex-direction: column;
                }

                .timeline-item {
                    display: flex;
                    gap: 16px;
                    padding: 16px 0;
                    border-bottom: 1px solid var(--border);
                }

                .timeline-item:last-child {
                    border-bottom: none;
                }

                .timeline-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .timeline-content {
                    flex: 1;
                    min-width: 0;
                }

                .timeline-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }

                .timeline-type {
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .timeline-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .timeline-summary {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    line-height: 1.5;
                }

                /* MEDDPICC Grid */
                .meddpicc-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .meddpicc-item {
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .meddpicc-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .meddpicc-category {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .meddpicc-letter {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.75rem;
                }

                .meddpicc-name {
                    font-weight: 500;
                    font-size: 0.875rem;
                }

                .meddpicc-status {
                    font-size: 0.7rem;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .meddpicc-notes {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                }

                .meddpicc-score-ring {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: conic-gradient(
                        var(--primary) calc(var(--score) * 3.6deg),
                        var(--bg-tertiary) 0deg
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .meddpicc-score-inner {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                /* Stakeholder Cards */
                .stakeholder-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .stakeholder-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: white;
                    flex-shrink: 0;
                }

                .stakeholder-info {
                    flex: 1;
                    min-width: 0;
                }

                .stakeholder-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .stakeholder-title {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .stakeholder-role {
                    font-size: 0.7rem;
                    padding: 3px 8px;
                    border-radius: 4px;
                    background: rgba(99, 102, 241, 0.15);
                    color: var(--primary-light);
                    font-weight: 500;
                }

                /* Quick Info Panel */
                .info-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .info-section {
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border);
                }

                .info-section:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .info-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 6px;
                }

                .info-value {
                    font-weight: 500;
                }

                /* Log Activity Modal */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .modal {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    overflow: hidden;
                }

                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .modal-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                }

                .modal-body {
                    padding: 20px;
                }

                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .activity-type-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .activity-type-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .activity-type-btn:hover {
                    border-color: var(--primary);
                }

                .activity-type-btn.selected {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .activity-type-icon {
                    font-size: 1.25rem;
                }

                .activity-type-label {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                @media (max-width: 1024px) {
                    .metrics-row {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .content-grid {
                        grid-template-columns: 1fr;
                    }

                    .meddpicc-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            {/* Hero Section */}
            <div className="deal-hero">
                <div className="deal-hero-content">
                    <div className="deal-title-row">
                        <div>
                            <h1 className="deal-title">
                                {deal.name}
                                {isFrozen && (
                                    <span className="frozen-badge">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        FROZEN
                                    </span>
                                )}
                            </h1>
                            <p className="deal-subtitle">
                                <Link href={`/accounts/${deal.account.id}`} style={{ color: "var(--primary-light)" }}>
                                    {deal.account.name}
                                </Link>
                                {" · "}
                                {deal.account.segment}
                            </p>
                        </div>
                        <div className="deal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowLogActivity(true)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Log Activity
                            </button>
                            <button className="btn btn-secondary">Edit</button>
                            <button className="btn btn-primary" disabled={isFrozen}>
                                Advance Stage →
                            </button>
                        </div>
                    </div>

                    {/* Stage Progress */}
                    <div className="stage-progress">
                        {STAGES.slice(0, -2).map((stage, idx) => {
                            const isCompleted = idx < currentStageIndex;
                            const isCurrent = idx === currentStageIndex;
                            const stageColor = STAGES[idx].color;

                            return (
                                <div key={stage.id} className="stage-step">
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                        <div
                                            className={`stage-dot ${isCompleted ? "completed" : isCurrent ? "current" : "future"}`}
                                            style={isCurrent ? { background: stageColor } : {}}
                                        >
                                            {isCompleted ? "✓" : idx + 1}
                                        </div>
                                        <span className={`stage-label ${isCurrent ? "current" : ""}`}>
                                            {stage.label}
                                        </span>
                                    </div>
                                    {idx < STAGES.length - 3 && (
                                        <div className={`stage-line ${isCompleted ? "completed" : ""}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Metrics Row */}
                    <div className="metrics-row">
                        <div className="metric-card">
                            <div className="metric-label">Amount</div>
                            <div className="metric-value currency">{formatCurrency(amount)}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Close Date</div>
                            <div className="metric-value">{formatDate(deal.closeDate)}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Forecast</div>
                            <div className="metric-value">{deal.forecast.replace(/_/g, " ")}</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">MEDDPICC</div>
                            <div className="metric-value" style={{ color: meddpiccScore >= 70 ? "#10b981" : meddpiccScore >= 40 ? "#f59e0b" : "#ef4444" }}>
                                {Math.round(meddpiccScore)}%
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">DRI Score</div>
                            <div className="metric-value" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: getDriColor(driState) }} />
                                {driScore}
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-label">Term</div>
                            <div className="metric-value">{deal.termMonths || 12} months</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === "activity" ? "active" : ""}`}
                        onClick={() => setActiveTab("activity")}
                    >
                        Activity
                        <span className="tab-badge">{deal.activities.length}</span>
                    </button>
                    <button
                        className={`tab ${activeTab === "stakeholders" ? "active" : ""}`}
                        onClick={() => setActiveTab("stakeholders")}
                    >
                        Stakeholders
                        <span className="tab-badge">{deal.stakeholders.length}</span>
                    </button>
                    <button
                        className={`tab ${activeTab === "meddpicc" ? "active" : ""}`}
                        onClick={() => setActiveTab("meddpicc")}
                    >
                        MEDDPICC
                    </button>
                    <button
                        className={`tab ${activeTab === "documents" ? "active" : ""}`}
                        onClick={() => setActiveTab("documents")}
                    >
                        Documents
                    </button>
                    <button
                        className={`tab ${activeTab === "closeplan" ? "active" : ""}`}
                        onClick={() => setActiveTab("closeplan")}
                    >
                        Close Plan
                    </button>
                    <button
                        className={`tab ${activeTab === "proofpack" ? "active" : ""}`}
                        onClick={() => setActiveTab("proofpack")}
                    >
                        Proof Pack
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="deal-content">
                {activeTab === "overview" && (
                    <div className="content-grid">
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {/* Recent Activity */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h3 className="card-title">Recent Activity</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("activity")}>
                                        View all →
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="timeline">
                                        {deal.activities.slice(0, 5).map((activity) => {
                                            const actInfo = ACTIVITY_ICONS[activity.type] || { icon: "•", color: "#6b7280" };
                                            return (
                                                <div key={activity.id} className="timeline-item">
                                                    <div
                                                        className="timeline-icon"
                                                        style={{ background: `${actInfo.color}20` }}
                                                    >
                                                        {actInfo.icon}
                                                    </div>
                                                    <div className="timeline-content">
                                                        <div className="timeline-header">
                                                            <span className="timeline-type">{activity.type}</span>
                                                            <span className="timeline-time">{formatRelativeTime(activity.occurredAt)}</span>
                                                        </div>
                                                        <p className="timeline-summary">{activity.summary || "No details"}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {deal.activities.length === 0 && (
                                            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
                                                No activities yet
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* MEDDPICC Summary */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h3 className="card-title">MEDDPICC Evidence</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("meddpicc")}>
                                        View details →
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                                        <div
                                            className="meddpicc-score-ring"
                                            style={{ "--score": meddpiccScore } as React.CSSProperties}
                                        >
                                            <div className="meddpicc-score-inner">{Math.round(meddpiccScore)}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                                {Object.entries(MEDDPICC_LABELS).map(([key, { full }]) => {
                                                    const item = deal.meddpicc.find(m => m.category === key);
                                                    return (
                                                        <div key={key} style={{ textAlign: "center" }}>
                                                            <div
                                                                style={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    borderRadius: 4,
                                                                    background: item ? getStatusColor(item.status) : "var(--bg-tertiary)",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontWeight: 700,
                                                                    fontSize: "0.75rem",
                                                                    margin: "0 auto 4px",
                                                                }}
                                                            >
                                                                {key[0]}
                                                            </div>
                                                            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                                                                {full.split(" ")[0]}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {/* Team */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h3 className="card-title">Deal Team</h3>
                                </div>
                                <div className="card-body">
                                    <div className="info-panel">
                                        <div className="info-section">
                                            <div className="info-label">Owner</div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div className="stakeholder-avatar" style={{ width: 28, height: 28, fontSize: "0.7rem" }}>
                                                    {deal.owner?.fullName?.split(" ").map(n => n[0]).join("") || "?"}
                                                </div>
                                                <span className="info-value">{deal.owner?.fullName || "Unassigned"}</span>
                                            </div>
                                        </div>
                                        {deal.se && (
                                            <div className="info-section">
                                                <div className="info-label">Solutions Engineer</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div className="stakeholder-avatar" style={{ width: 28, height: 28, fontSize: "0.7rem", background: "#8b5cf6" }}>
                                                        {deal.se.fullName.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <span className="info-value">{deal.se.fullName}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Key Stakeholders */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h3 className="card-title">Key Contacts</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("stakeholders")}>
                                        View all →
                                    </button>
                                </div>
                                <div className="card-body" style={{ padding: 12 }}>
                                    {deal.stakeholders.slice(0, 3).map((s) => (
                                        <div key={s.id} className="stakeholder-card">
                                            <div className="stakeholder-avatar">
                                                {s.contact.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div className="stakeholder-info">
                                                <div className="stakeholder-name">{s.contact.name}</div>
                                                <div className="stakeholder-title">{s.contact.title || "—"}</div>
                                            </div>
                                            <span className="stakeholder-role">{s.roleInDeal.replace(/_/g, " ")}</span>
                                        </div>
                                    ))}
                                    {deal.stakeholders.length === 0 && (
                                        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 12 }}>
                                            No stakeholders mapped
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Products */}
                            <div className="content-card">
                                <div className="card-header">
                                    <h3 className="card-title">Products</h3>
                                </div>
                                <div className="card-body">
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {(deal.productMix || []).map((product) => (
                                            <span
                                                key={product}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: "rgba(99, 102, 241, 0.15)",
                                                    color: "var(--primary-light)",
                                                    borderRadius: 6,
                                                    fontSize: "0.8rem",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {product}
                                            </span>
                                        ))}
                                        {(!deal.productMix || deal.productMix.length === 0) && (
                                            <span style={{ color: "var(--text-muted)" }}>No products selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "activity" && (
                    <div className="content-card">
                        <div className="card-header">
                            <h3 className="card-title">Activity Timeline</h3>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowLogActivity(true)}>
                                + Log Activity
                            </button>
                        </div>
                        <div className="card-body">
                            <div className="timeline">
                                {deal.activities.map((activity) => {
                                    const actInfo = ACTIVITY_ICONS[activity.type] || { icon: "•", color: "#6b7280" };
                                    return (
                                        <div key={activity.id} className="timeline-item">
                                            <div
                                                className="timeline-icon"
                                                style={{ background: `${actInfo.color}20` }}
                                            >
                                                {actInfo.icon}
                                            </div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <span className="timeline-type">{activity.type}</span>
                                                    <span className="timeline-time">{formatRelativeTime(activity.occurredAt)}</span>
                                                </div>
                                                <p className="timeline-summary">{activity.summary || "No details"}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {deal.activities.length === 0 && (
                                    <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>
                                        No activities logged yet. Click "Log Activity" to add one.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "stakeholders" && (
                    <div className="content-card">
                        <div className="card-header">
                            <h3 className="card-title">Stakeholder Map</h3>
                            <button className="btn btn-primary btn-sm">+ Add Contact</button>
                        </div>
                        <div className="card-body">
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
                                {deal.stakeholders.map((s) => (
                                    <div key={s.id} className="stakeholder-card" style={{ margin: 0 }}>
                                        <div className="stakeholder-avatar">
                                            {s.contact.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div className="stakeholder-info">
                                            <div className="stakeholder-name">{s.contact.name}</div>
                                            <div className="stakeholder-title">{s.contact.title || "—"}</div>
                                            {s.contact.email && (
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                                                    {s.contact.email}
                                                </div>
                                            )}
                                        </div>
                                        <span className="stakeholder-role">{s.roleInDeal.replace(/_/g, " ")}</span>
                                    </div>
                                ))}
                            </div>
                            {deal.stakeholders.length === 0 && (
                                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>
                                    No stakeholders mapped yet. Click "Add Contact" to start building your map.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "meddpicc" && (
                    <div className="content-card">
                        <div className="card-header">
                            <h3 className="card-title">MEDDPICC Evidence</h3>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                                    Score: <strong style={{ color: meddpiccScore >= 70 ? "#10b981" : meddpiccScore >= 40 ? "#f59e0b" : "#ef4444" }}>{Math.round(meddpiccScore)}%</strong>
                                </span>
                                <button className="btn btn-primary btn-sm">+ Add Evidence</button>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="meddpicc-grid">
                                {Object.entries(MEDDPICC_LABELS).map(([key, { full, weight }]) => {
                                    const item = deal.meddpicc.find(m => m.category === key);
                                    const status = item?.status || "MISSING";
                                    return (
                                        <div key={key} className="meddpicc-item">
                                            <div className="meddpicc-header">
                                                <div className="meddpicc-category">
                                                    <div className="meddpicc-letter">{key[0]}</div>
                                                    <span className="meddpicc-name">{full}</span>
                                                </div>
                                                <span
                                                    className="meddpicc-status"
                                                    style={{
                                                        background: `${getStatusColor(status)}20`,
                                                        color: getStatusColor(status),
                                                    }}
                                                >
                                                    {status.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                                Weight: {weight}%
                                            </div>
                                            {item?.notes ? (
                                                <p className="meddpicc-notes">{item.notes}</p>
                                            ) : (
                                                <p className="meddpicc-notes" style={{ fontStyle: "italic" }}>
                                                    No evidence recorded
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "documents" && (
                    <div className="content-card">
                        <div className="card-header">
                            <h3 className="card-title">Documents</h3>
                            <button className="btn btn-primary btn-sm">+ Upload</button>
                        </div>
                        <div className="card-body" style={{ textAlign: "center", padding: 60 }}>
                            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📄</div>
                            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
                                No documents uploaded yet
                            </p>
                            <button className="btn btn-secondary">Upload Document</button>
                        </div>
                    </div>
                )}

                {activeTab === "closeplan" && (
                    <div style={{ maxWidth: 800 }}>
                        <ClosePlanPanel dealId={deal.id} demoMode={true} />
                    </div>
                )}

                {activeTab === "proofpack" && (
                    <div style={{ maxWidth: 800 }}>
                        <ProofPackPanel dealId={deal.id} dealName={deal.name} demoMode={true} />
                    </div>
                )}
            </div>

            {/* Log Activity Modal */}
            {showLogActivity && (
                <div className="modal-overlay" onClick={() => setShowLogActivity(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Log Activity</h2>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowLogActivity(false)}
                                style={{ padding: 8 }}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="activity-type-grid">
                                {Object.entries(ACTIVITY_ICONS).slice(0, 4).map(([type, { icon }]) => (
                                    <button key={type} className="activity-type-btn">
                                        <span className="activity-type-icon">{icon}</span>
                                        <span className="activity-type-label">{type}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Summary</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    placeholder="What happened?"
                                    style={{ resize: "vertical" }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-input" defaultValue={new Date().toISOString().split("T")[0]} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowLogActivity(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary">Log Activity</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
