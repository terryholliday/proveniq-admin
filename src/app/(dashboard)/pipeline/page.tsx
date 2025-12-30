"use client";

import { useEffect, useState, useRef } from "react";
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

const STAGES = [
    { id: "INTAKE", label: "Intake", color: "#6b7280" },
    { id: "QUALIFIED", label: "Qualified", color: "#3b82f6" },
    { id: "DISCOVERY", label: "Discovery", color: "#8b5cf6" },
    { id: "SOLUTION_FIT", label: "Solution Fit", color: "#a855f7" },
    { id: "POV", label: "POV / Trial", color: "#ec4899" },
    { id: "PROPOSAL", label: "Proposal", color: "#f97316" },
    { id: "NEGOTIATION", label: "Negotiation", color: "#eab308" },
    { id: "COMMIT", label: "Commit", color: "#22c55e" },
    { id: "CLOSED_WON", label: "Closed Won", color: "#10b981" },
    { id: "CLOSED_LOST", label: "Closed Lost", color: "#ef4444" },
];

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays}d`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDriColor(state: string): string {
    switch (state?.toUpperCase()) {
        case "GREEN": return "#10b981";
        case "YELLOW": return "#eab308";
        case "RED": return "#ef4444";
        default: return "#374151";
    }
}

export default function PipelinePage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");

    useEffect(() => {
        async function loadDeals() {
            try {
                setLoading(true);
                const res = await fetchDeals({ limit: 100 });
                setDeals(res.data || []);
            } catch (e) {
                console.error("Failed to load deals:", e);
            } finally {
                setLoading(false);
            }
        }
        loadDeals();
    }, []);

    const handleDragStart = (deal: Deal) => {
        setDraggedDeal(deal);
    };

    const handleDragEnd = () => {
        setDraggedDeal(null);
        setDragOverStage(null);
    };

    const handleDragOver = (e: React.DragEvent, stageId: string) => {
        e.preventDefault();
        setDragOverStage(stageId);
    };

    const handleDrop = async (stageId: string) => {
        if (draggedDeal && draggedDeal.stage !== stageId) {
            // Optimistic update
            setDeals(deals.map(d => 
                d.id === draggedDeal.id ? { ...d, stage: stageId } : d
            ));
            
            // TODO: API call to update deal stage
            // await updateDealStage(draggedDeal.id, stageId);
        }
        setDraggedDeal(null);
        setDragOverStage(null);
    };

    const getDealsForStage = (stageId: string) => {
        return deals.filter(d => d.stage === stageId);
    };

    const getStageTotal = (stageId: string) => {
        return getDealsForStage(stageId).reduce((sum, d) => {
            return sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0);
        }, 0);
    };

    const totalPipeline = deals.reduce((sum, d) => {
        const amount = d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0;
        return sum + amount;
    }, 0);

    // Filter out closed stages for active pipeline view
    const activeStages = STAGES.filter(s => !s.id.startsWith("CLOSED"));

    return (
        <>
            <style jsx global>{`
                .pipeline-container {
                    display: flex;
                    gap: 12px;
                    padding: 0 24px 24px;
                    overflow-x: auto;
                    min-height: calc(100vh - 180px);
                }

                .pipeline-column {
                    flex: 0 0 280px;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                    overflow: hidden;
                }

                .pipeline-column.drag-over {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.05);
                }

                .column-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .column-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .column-indicator {
                    width: 4px;
                    height: 20px;
                    border-radius: 2px;
                }

                .column-name {
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                .column-count {
                    background: var(--bg-tertiary);
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .column-total {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-family: monospace;
                }

                .column-cards {
                    flex: 1;
                    padding: 12px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .deal-card {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: 14px;
                    cursor: grab;
                    transition: all 0.15s ease;
                }

                .deal-card:hover {
                    border-color: var(--border-hover);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .deal-card.dragging {
                    opacity: 0.5;
                    cursor: grabbing;
                }

                .deal-card.frozen {
                    border-left: 3px solid var(--danger);
                }

                .deal-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    margin-bottom: 6px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .deal-name a {
                    color: inherit;
                    text-decoration: none;
                }

                .deal-name a:hover {
                    color: var(--primary-light);
                }

                .deal-account {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 10px;
                }

                .deal-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid var(--border);
                }

                .deal-amount {
                    font-weight: 700;
                    font-size: 1rem;
                    color: var(--text-primary);
                    font-family: monospace;
                }

                .deal-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .deal-close-date {
                    font-size: 0.75rem;
                    padding: 3px 8px;
                    border-radius: 4px;
                    background: var(--bg-secondary);
                }

                .deal-close-date.overdue {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .deal-close-date.soon {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }

                .dri-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .deal-owner {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 10px;
                }

                .owner-avatar {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: white;
                }

                .owner-name {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .forecast-badge {
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .forecast-pipeline { background: rgba(107, 114, 128, 0.15); color: #9ca3af; }
                .forecast-best_case { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
                .forecast-commit { background: rgba(16, 185, 129, 0.15); color: #34d399; }

                .view-toggle {
                    display: flex;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-md);
                    padding: 4px;
                }

                .view-toggle button {
                    padding: 6px 12px;
                    border-radius: var(--radius-sm);
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    transition: all 0.15s ease;
                }

                .view-toggle button.active {
                    background: var(--primary);
                    color: white;
                }

                .view-toggle button:hover:not(.active) {
                    color: var(--text-primary);
                }

                .pipeline-stats {
                    display: flex;
                    gap: 24px;
                    padding: 16px 24px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border);
                }

                .pipeline-stat {
                    display: flex;
                    flex-direction: column;
                }

                .pipeline-stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    font-family: monospace;
                }

                .pipeline-stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .empty-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 16px;
                    color: var(--text-muted);
                    font-size: 0.8rem;
                    text-align: center;
                }

                .empty-column svg {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 8px;
                    opacity: 0.3;
                }

                /* Quick view modal */
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

                .modal-content {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-xl);
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .modal-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    transition: all 0.15s ease;
                }

                .modal-close:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .modal-body {
                    padding: 24px;
                }

                .modal-section {
                    margin-bottom: 20px;
                }

                .modal-section-title {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 8px;
                }

                .modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
            `}</style>

            <Header
                title="Pipeline"
                subtitle={`${deals.length} deals · ${formatCurrency(totalPipeline)} total value`}
                actions={
                    <div className="flex items-center gap-4">
                        <div className="view-toggle">
                            <button
                                className={viewMode === "pipeline" ? "active" : ""}
                                onClick={() => setViewMode("pipeline")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                            </button>
                            <button
                                className={viewMode === "table" ? "active" : ""}
                                onClick={() => setViewMode("table")}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M3 12h18M3 18h18" />
                                </svg>
                            </button>
                        </div>
                        <button className="btn btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            New Deal
                        </button>
                    </div>
                }
            />

            {/* Pipeline Stats */}
            <div className="pipeline-stats">
                <div className="pipeline-stat">
                    <div className="pipeline-stat-value">{formatCurrency(totalPipeline)}</div>
                    <div className="pipeline-stat-label">Total Pipeline</div>
                </div>
                <div className="pipeline-stat">
                    <div className="pipeline-stat-value">{deals.filter(d => d.forecast === "COMMIT").length}</div>
                    <div className="pipeline-stat-label">Commit Deals</div>
                </div>
                <div className="pipeline-stat">
                    <div className="pipeline-stat-value">
                        {formatCurrency(deals.filter(d => d.forecast === "COMMIT").reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0))}
                    </div>
                    <div className="pipeline-stat-label">Commit Value</div>
                </div>
                <div className="pipeline-stat">
                    <div className="pipeline-stat-value">{deals.filter(d => d.enforcementState === "FROZEN").length}</div>
                    <div className="pipeline-stat-label">Frozen Deals</div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
                    <div className="loading-spinner" />
                </div>
            ) : (
                <div className="pipeline-container">
                    {activeStages.map((stage) => {
                        const stageDeals = getDealsForStage(stage.id);
                        const stageTotal = getStageTotal(stage.id);
                        const isDragOver = dragOverStage === stage.id;

                        return (
                            <div
                                key={stage.id}
                                className={`pipeline-column ${isDragOver ? "drag-over" : ""}`}
                                onDragOver={(e) => handleDragOver(e, stage.id)}
                                onDragLeave={() => setDragOverStage(null)}
                                onDrop={() => handleDrop(stage.id)}
                            >
                                <div className="column-header">
                                    <div className="column-title">
                                        <div
                                            className="column-indicator"
                                            style={{ background: stage.color }}
                                        />
                                        <span className="column-name">{stage.label}</span>
                                        <span className="column-count">{stageDeals.length}</span>
                                    </div>
                                    <span className="column-total">{formatCurrency(stageTotal)}</span>
                                </div>

                                <div className="column-cards">
                                    {stageDeals.length === 0 ? (
                                        <div className="empty-column">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <path d="M3 9h18M9 21V9" />
                                            </svg>
                                            No deals in {stage.label}
                                        </div>
                                    ) : (
                                        stageDeals.map((deal) => {
                                            const amount = deal.amountMicros
                                                ? parseInt(deal.amountMicros) / 1_000_000
                                                : 0;
                                            const latestDri = deal.driScores?.[0];
                                            const driColor = getDriColor(latestDri?.state || "");
                                            const isDragging = draggedDeal?.id === deal.id;
                                            const isFrozen = deal.enforcementState === "FROZEN";

                                            // Calculate close date status
                                            let closeDateClass = "";
                                            if (deal.closeDate) {
                                                const daysUntil = Math.ceil(
                                                    (new Date(deal.closeDate).getTime() - Date.now()) /
                                                        (1000 * 60 * 60 * 24)
                                                );
                                                if (daysUntil < 0) closeDateClass = "overdue";
                                                else if (daysUntil <= 7) closeDateClass = "soon";
                                            }

                                            return (
                                                <div
                                                    key={deal.id}
                                                    className={`deal-card ${isDragging ? "dragging" : ""} ${isFrozen ? "frozen" : ""}`}
                                                    draggable
                                                    onDragStart={() => handleDragStart(deal)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => setSelectedDeal(deal)}
                                                >
                                                    <div className="deal-name">
                                                        <Link href={`/deals/${deal.id}`} onClick={(e) => e.stopPropagation()}>
                                                            {deal.name}
                                                        </Link>
                                                        {isFrozen && (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                                <path d="M7 11V7a5 5 0 0110 0v4" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="deal-account">{deal.account?.name || "No account"}</div>

                                                    <div className="deal-info">
                                                        <span className={`forecast-badge forecast-${deal.forecast.toLowerCase()}`}>
                                                            {deal.forecast.replace(/_/g, " ")}
                                                        </span>
                                                        {deal.closeDate && (
                                                            <span className={`deal-close-date ${closeDateClass}`}>
                                                                {formatDate(deal.closeDate)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="deal-meta">
                                                        <span className="deal-amount">{formatCurrency(amount)}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="dri-dot"
                                                                style={{ background: driColor }}
                                                                title={`DRI: ${latestDri?.total || 0}`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="deal-owner">
                                                        <div className="owner-avatar">
                                                            {deal.owner?.fullName?.split(" ").map(n => n[0]).join("") || "?"}
                                                        </div>
                                                        <span className="owner-name">{deal.owner?.fullName || "Unassigned"}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Closed Columns (collapsed) */}
                    <div className="pipeline-column" style={{ flex: "0 0 200px", opacity: 0.7 }}>
                        <div className="column-header">
                            <div className="column-title">
                                <div className="column-indicator" style={{ background: "#10b981" }} />
                                <span className="column-name">Closed Won</span>
                                <span className="column-count">{getDealsForStage("CLOSED_WON").length}</span>
                            </div>
                        </div>
                        <div className="column-cards">
                            <div className="empty-column" style={{ fontSize: "0.75rem" }}>
                                {formatCurrency(getStageTotal("CLOSED_WON"))} won
                            </div>
                        </div>
                    </div>

                    <div className="pipeline-column" style={{ flex: "0 0 200px", opacity: 0.7 }}>
                        <div className="column-header">
                            <div className="column-title">
                                <div className="column-indicator" style={{ background: "#ef4444" }} />
                                <span className="column-name">Closed Lost</span>
                                <span className="column-count">{getDealsForStage("CLOSED_LOST").length}</span>
                            </div>
                        </div>
                        <div className="column-cards">
                            <div className="empty-column" style={{ fontSize: "0.75rem" }}>
                                {getDealsForStage("CLOSED_LOST").length} lost
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick View Modal */}
            {selectedDeal && (
                <div className="modal-overlay" onClick={() => setSelectedDeal(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">{selectedDeal.name}</h2>
                                <p className="text-secondary" style={{ fontSize: "0.875rem", marginTop: 4 }}>
                                    {selectedDeal.account?.name}
                                </p>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedDeal(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                                <div className="modal-section">
                                    <div className="modal-section-title">Amount</div>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "monospace" }}>
                                        {formatCurrency(selectedDeal.amountMicros ? parseInt(selectedDeal.amountMicros) / 1_000_000 : 0)}
                                    </div>
                                </div>
                                <div className="modal-section">
                                    <div className="modal-section-title">Close Date</div>
                                    <div style={{ fontSize: "1rem" }}>
                                        {selectedDeal.closeDate
                                            ? new Date(selectedDeal.closeDate).toLocaleDateString("en-US", {
                                                  month: "long",
                                                  day: "numeric",
                                                  year: "numeric",
                                              })
                                            : "Not set"}
                                    </div>
                                </div>
                                <div className="modal-section">
                                    <div className="modal-section-title">Stage</div>
                                    <span
                                        className="badge"
                                        style={{
                                            background: `${STAGES.find(s => s.id === selectedDeal.stage)?.color}20`,
                                            color: STAGES.find(s => s.id === selectedDeal.stage)?.color,
                                        }}
                                    >
                                        {selectedDeal.stage.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <div className="modal-section">
                                    <div className="modal-section-title">Forecast</div>
                                    <span className={`badge forecast-${selectedDeal.forecast.toLowerCase()}`}>
                                        {selectedDeal.forecast.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <div className="modal-section">
                                    <div className="modal-section-title">Owner</div>
                                    <div className="deal-owner" style={{ marginTop: 0 }}>
                                        <div className="owner-avatar">
                                            {selectedDeal.owner?.fullName?.split(" ").map(n => n[0]).join("") || "?"}
                                        </div>
                                        <span style={{ color: "var(--text-primary)" }}>
                                            {selectedDeal.owner?.fullName || "Unassigned"}
                                        </span>
                                    </div>
                                </div>
                                <div className="modal-section">
                                    <div className="modal-section-title">DRI Score</div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="dri-dot"
                                            style={{
                                                background: getDriColor(selectedDeal.driScores?.[0]?.state || ""),
                                                width: 12,
                                                height: 12,
                                            }}
                                        />
                                        <span style={{ fontWeight: 600 }}>
                                            {selectedDeal.driScores?.[0]?.total || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedDeal.enforcementState === "FROZEN" && (
                                <div
                                    style={{
                                        marginTop: 20,
                                        padding: 16,
                                        background: "rgba(239, 68, 68, 0.1)",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        borderRadius: "var(--radius-md)",
                                    }}
                                >
                                    <div className="flex items-center gap-2" style={{ color: "#ef4444", fontWeight: 600, marginBottom: 4 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" />
                                            <path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        Deal is Frozen
                                    </div>
                                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                        This deal cannot be modified until it is unfrozen by an authorized user.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setSelectedDeal(null)}>
                                Close
                            </button>
                            <Link href={`/deals/${selectedDeal.id}`} className="btn btn-primary">
                                View Full Details →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
