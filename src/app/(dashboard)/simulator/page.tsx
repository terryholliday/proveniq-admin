"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { fetchDeals } from "@/lib/api-client";

interface Deal {
    id: string;
    name: string;
    stage: string;
    forecast: string;
    amountMicros?: string;
    closeDate?: string;
    account: { name: string };
}

interface Scenario {
    id: string;
    name: string;
    deals: { dealId: string; action: "win" | "lose" | "slip" | "unchanged"; newCloseDate?: string }[];
}

const STAGES = [
    { id: "INTAKE", label: "Intake" },
    { id: "QUALIFIED", label: "Qualified" },
    { id: "DISCOVERY", label: "Discovery" },
    { id: "SOLUTION_FIT", label: "Solution Fit" },
    { id: "POV", label: "POV" },
    { id: "PROPOSAL", label: "Proposal" },
    { id: "NEGOTIATION", label: "Negotiation" },
    { id: "COMMIT", label: "Commit" },
];

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
    return `$${amount}`;
}

export default function SimulatorPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [scenarios, setScenarios] = useState<Record<string, "win" | "lose" | "slip" | "unchanged">>({});
    const [quarterTarget, setQuarterTarget] = useState(2500000);
    const [viewMode, setViewMode] = useState<"optimistic" | "realistic" | "pessimistic">("realistic");

    useEffect(() => {
        async function loadDeals() {
            try {
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

    // Filter active pipeline deals
    const pipelineDeals = deals.filter(d => 
        !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)
    );

    // Calculate base metrics
    const baseCommit = deals
        .filter(d => d.forecast === "COMMIT")
        .reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);
    
    const baseBestCase = deals
        .filter(d => d.forecast === "BEST_CASE")
        .reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);

    const basePipeline = pipelineDeals
        .reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);

    // Calculate scenario-adjusted metrics
    const scenarioWins = Object.entries(scenarios)
        .filter(([_, action]) => action === "win")
        .map(([id]) => deals.find(d => d.id === id))
        .filter(Boolean) as Deal[];

    const scenarioLosses = Object.entries(scenarios)
        .filter(([_, action]) => action === "lose")
        .map(([id]) => deals.find(d => d.id === id))
        .filter(Boolean) as Deal[];

    const scenarioSlips = Object.entries(scenarios)
        .filter(([_, action]) => action === "slip")
        .map(([id]) => deals.find(d => d.id === id))
        .filter(Boolean) as Deal[];

    const scenarioWinValue = scenarioWins.reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);
    const scenarioLossValue = scenarioLosses.reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);
    const scenarioSlipValue = scenarioSlips.reduce((sum, d) => sum + (d.amountMicros ? parseInt(d.amountMicros) / 1_000_000 : 0), 0);

    // Projected outcomes based on view mode
    const winRates = { optimistic: 0.45, realistic: 0.30, pessimistic: 0.20 };
    const winRate = winRates[viewMode];

    const projectedFromPipeline = (basePipeline - scenarioWinValue - scenarioLossValue - scenarioSlipValue) * winRate;
    const projectedTotal = baseCommit + scenarioWinValue + projectedFromPipeline;
    const gapToTarget = quarterTarget - projectedTotal;
    const attainmentPercent = (projectedTotal / quarterTarget) * 100;

    const setDealScenario = (dealId: string, action: "win" | "lose" | "slip" | "unchanged") => {
        if (action === "unchanged") {
            const newScenarios = { ...scenarios };
            delete newScenarios[dealId];
            setScenarios(newScenarios);
        } else {
            setScenarios({ ...scenarios, [dealId]: action });
        }
    };

    const resetScenarios = () => setScenarios({});

    const presetScenarios = {
        optimistic: () => {
            const newScenarios: Record<string, "win" | "lose" | "slip" | "unchanged"> = {};
            pipelineDeals.filter(d => d.forecast === "COMMIT" || d.forecast === "BEST_CASE").forEach(d => {
                newScenarios[d.id] = "win";
            });
            setScenarios(newScenarios);
        },
        conservative: () => {
            const newScenarios: Record<string, "win" | "lose" | "slip" | "unchanged"> = {};
            pipelineDeals.filter(d => d.forecast === "COMMIT").forEach(d => {
                newScenarios[d.id] = "win";
            });
            pipelineDeals.filter(d => d.forecast === "BEST_CASE").forEach(d => {
                newScenarios[d.id] = "slip";
            });
            setScenarios(newScenarios);
        },
        worst: () => {
            const newScenarios: Record<string, "win" | "lose" | "slip" | "unchanged"> = {};
            pipelineDeals.filter(d => d.forecast !== "COMMIT").forEach(d => {
                newScenarios[d.id] = "lose";
            });
            setScenarios(newScenarios);
        },
    };

    return (
        <>
            <style jsx global>{`
                .simulator-container {
                    padding: 24px;
                    max-width: 1600px;
                    margin: 0 auto;
                }

                .simulator-grid {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 24px;
                }

                .projection-panel {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    position: sticky;
                    top: 24px;
                }

                .projection-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }

                .projection-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                }

                .target-input {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .target-input label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .target-input input {
                    width: 120px;
                    text-align: right;
                    font-family: monospace;
                }

                .projection-gauge {
                    margin-bottom: 24px;
                }

                .gauge-bar {
                    height: 24px;
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    margin-bottom: 8px;
                }

                .gauge-fill {
                    height: 100%;
                    border-radius: 12px;
                    transition: width 0.5s ease;
                }

                .gauge-target {
                    position: absolute;
                    top: -4px;
                    bottom: -4px;
                    width: 3px;
                    background: white;
                    border-radius: 2px;
                }

                .gauge-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .projection-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .projection-stat {
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    padding: 16px;
                }

                .projection-stat-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .projection-stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    font-family: monospace;
                }

                .projection-stat-value.positive {
                    color: #10b981;
                }

                .projection-stat-value.negative {
                    color: #ef4444;
                }

                .scenario-presets {
                    margin-bottom: 24px;
                }

                .presets-title {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                }

                .presets-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .preset-btn {
                    padding: 10px 12px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                }

                .preset-btn:hover {
                    border-color: var(--primary);
                }

                .preset-btn.optimistic { border-color: #10b981; color: #10b981; }
                .preset-btn.conservative { border-color: #f59e0b; color: #f59e0b; }
                .preset-btn.worst { border-color: #ef4444; color: #ef4444; }

                .scenario-summary {
                    padding: 16px;
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 0.85rem;
                }

                .summary-row:not(:last-child) {
                    border-bottom: 1px solid var(--border);
                }

                .summary-label {
                    color: var(--text-secondary);
                }

                .summary-value {
                    font-weight: 600;
                    font-family: monospace;
                }

                /* Deal List */
                .deals-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .deals-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .deals-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                }

                .deal-scenario-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                    transition: all 0.15s ease;
                }

                .deal-scenario-card.win {
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.05);
                }

                .deal-scenario-card.lose {
                    border-color: #ef4444;
                    background: rgba(239, 68, 68, 0.05);
                }

                .deal-scenario-card.slip {
                    border-color: #f59e0b;
                    background: rgba(245, 158, 11, 0.05);
                }

                .deal-info {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .deal-name {
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .deal-account {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .deal-amount {
                    font-size: 1.125rem;
                    font-weight: 700;
                    font-family: monospace;
                }

                .deal-meta {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .deal-badge {
                    font-size: 0.7rem;
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-weight: 500;
                }

                .deal-badge.stage {
                    background: rgba(99, 102, 241, 0.15);
                    color: var(--primary-light);
                }

                .deal-badge.forecast {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                }

                .scenario-buttons {
                    display: flex;
                    gap: 8px;
                }

                .scenario-btn {
                    flex: 1;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border: 1px solid var(--border);
                    background: var(--bg-tertiary);
                }

                .scenario-btn:hover {
                    border-color: var(--border-hover);
                }

                .scenario-btn.active {
                    color: white;
                }

                .scenario-btn.win.active {
                    background: #10b981;
                    border-color: #10b981;
                }

                .scenario-btn.lose.active {
                    background: #ef4444;
                    border-color: #ef4444;
                }

                .scenario-btn.slip.active {
                    background: #f59e0b;
                    border-color: #f59e0b;
                }

                @media (max-width: 1200px) {
                    .simulator-grid {
                        grid-template-columns: 1fr;
                    }

                    .projection-panel {
                        position: static;
                    }
                }
            `}</style>

            <Header
                title="Pipeline Simulator"
                subtitle="Model what-if scenarios for your pipeline"
                actions={
                    <button className="btn btn-secondary" onClick={resetScenarios}>
                        Reset All
                    </button>
                }
            />

            <div className="simulator-container">
                {loading ? (
                    <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    <div className="simulator-grid">
                        {/* Deals List */}
                        <div className="deals-panel">
                            <div className="deals-header">
                                <h2 className="deals-title">Pipeline Deals ({pipelineDeals.length})</h2>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                    {Object.keys(scenarios).length} scenarios applied
                                </span>
                            </div>

                            {pipelineDeals.map((deal) => {
                                const amount = deal.amountMicros ? parseInt(deal.amountMicros) / 1_000_000 : 0;
                                const currentScenario = scenarios[deal.id];

                                return (
                                    <div
                                        key={deal.id}
                                        className={`deal-scenario-card ${currentScenario || ""}`}
                                    >
                                        <div className="deal-info">
                                            <div>
                                                <div className="deal-name">{deal.name}</div>
                                                <div className="deal-account">{deal.account?.name}</div>
                                            </div>
                                            <div className="deal-amount">{formatCurrency(amount)}</div>
                                        </div>

                                        <div className="deal-meta">
                                            <span className="deal-badge stage">{deal.stage.replace(/_/g, " ")}</span>
                                            <span className="deal-badge forecast">{deal.forecast}</span>
                                        </div>

                                        <div className="scenario-buttons">
                                            <button
                                                className={`scenario-btn win ${currentScenario === "win" ? "active" : ""}`}
                                                onClick={() => setDealScenario(deal.id, currentScenario === "win" ? "unchanged" : "win")}
                                            >
                                                ✓ Win
                                            </button>
                                            <button
                                                className={`scenario-btn slip ${currentScenario === "slip" ? "active" : ""}`}
                                                onClick={() => setDealScenario(deal.id, currentScenario === "slip" ? "unchanged" : "slip")}
                                            >
                                                → Slip
                                            </button>
                                            <button
                                                className={`scenario-btn lose ${currentScenario === "lose" ? "active" : ""}`}
                                                onClick={() => setDealScenario(deal.id, currentScenario === "lose" ? "unchanged" : "lose")}
                                            >
                                                ✗ Lose
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Projection Panel */}
                        <div className="projection-panel">
                            <div className="projection-header">
                                <h2 className="projection-title">Projected Outcome</h2>
                                <div className="target-input">
                                    <label>Target:</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={`$${(quarterTarget / 1_000_000).toFixed(1)}M`}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                            if (!isNaN(val)) setQuarterTarget(val * 1_000_000);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Gauge */}
                            <div className="projection-gauge">
                                <div className="gauge-bar">
                                    <div
                                        className="gauge-fill"
                                        style={{
                                            width: `${Math.min(attainmentPercent, 100)}%`,
                                            background: attainmentPercent >= 100 ? "#10b981" 
                                                : attainmentPercent >= 80 ? "#22c55e"
                                                : attainmentPercent >= 60 ? "#f59e0b" : "#ef4444",
                                        }}
                                    />
                                    <div className="gauge-target" style={{ left: "100%" }} />
                                </div>
                                <div className="gauge-labels">
                                    <span>$0</span>
                                    <span style={{ 
                                        fontWeight: 600, 
                                        color: attainmentPercent >= 100 ? "#10b981" : "var(--text-primary)" 
                                    }}>
                                        {attainmentPercent.toFixed(0)}% of target
                                    </span>
                                    <span>{formatCurrency(quarterTarget)}</span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="projection-stats">
                                <div className="projection-stat">
                                    <div className="projection-stat-label">Projected Close</div>
                                    <div className="projection-stat-value">{formatCurrency(projectedTotal)}</div>
                                </div>
                                <div className="projection-stat">
                                    <div className="projection-stat-label">Gap to Target</div>
                                    <div className={`projection-stat-value ${gapToTarget <= 0 ? "positive" : "negative"}`}>
                                        {gapToTarget <= 0 ? "+" : "-"}{formatCurrency(Math.abs(gapToTarget))}
                                    </div>
                                </div>
                                <div className="projection-stat">
                                    <div className="projection-stat-label">Scenario Wins</div>
                                    <div className="projection-stat-value positive">+{formatCurrency(scenarioWinValue)}</div>
                                </div>
                                <div className="projection-stat">
                                    <div className="projection-stat-label">Scenario Losses</div>
                                    <div className="projection-stat-value negative">-{formatCurrency(scenarioLossValue)}</div>
                                </div>
                            </div>

                            {/* Presets */}
                            <div className="scenario-presets">
                                <div className="presets-title">Quick Scenarios</div>
                                <div className="presets-grid">
                                    <button className="preset-btn optimistic" onClick={presetScenarios.optimistic}>
                                        🚀 Best Case
                                    </button>
                                    <button className="preset-btn conservative" onClick={presetScenarios.conservative}>
                                        📊 Conservative
                                    </button>
                                    <button className="preset-btn worst" onClick={presetScenarios.worst}>
                                        ⚠️ Worst Case
                                    </button>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="scenario-summary">
                                <div className="summary-row">
                                    <span className="summary-label">Base Commit</span>
                                    <span className="summary-value">{formatCurrency(baseCommit)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">+ Scenario Wins</span>
                                    <span className="summary-value" style={{ color: "#10b981" }}>+{formatCurrency(scenarioWinValue)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">+ Projected Pipeline ({(winRate * 100).toFixed(0)}%)</span>
                                    <span className="summary-value">+{formatCurrency(projectedFromPipeline)}</span>
                                </div>
                                <div className="summary-row" style={{ fontWeight: 600 }}>
                                    <span className="summary-label">Total Projected</span>
                                    <span className="summary-value">{formatCurrency(projectedTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
