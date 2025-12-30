"use client";

import { useState } from "react";

interface WinProbabilityProps {
    deal: {
        stage: string;
        meddpiccScore: number;
        driScore: number;
        daysInStage: number;
        hasChampion: boolean;
        hasEconomicBuyer: boolean;
        competitorCount: number;
        stakeholderCount: number;
        activityCount: number;
        amount: number;
    };
}

interface Factor {
    name: string;
    score: number;
    weight: number;
    impact: "positive" | "negative" | "neutral";
    description: string;
}

function calculateWinProbability(deal: WinProbabilityProps["deal"]): { probability: number; factors: Factor[] } {
    const factors: Factor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Stage factor (25% weight)
    const stageScores: Record<string, number> = {
        INTAKE: 10, QUALIFIED: 20, DISCOVERY: 30, SOLUTION_FIT: 45,
        POV: 55, PROPOSAL: 65, NEGOTIATION: 75, COMMIT: 90,
    };
    const stageScore = stageScores[deal.stage] || 0;
    factors.push({
        name: "Deal Stage",
        score: stageScore,
        weight: 25,
        impact: stageScore >= 50 ? "positive" : stageScore >= 30 ? "neutral" : "negative",
        description: `${deal.stage.replace(/_/g, " ")} stage historically has ${stageScore}% conversion`,
    });
    totalScore += stageScore * 0.25;
    totalWeight += 25;

    // MEDDPICC score (20% weight)
    factors.push({
        name: "MEDDPICC Score",
        score: deal.meddpiccScore,
        weight: 20,
        impact: deal.meddpiccScore >= 70 ? "positive" : deal.meddpiccScore >= 40 ? "neutral" : "negative",
        description: `${deal.meddpiccScore}% qualification completeness`,
    });
    totalScore += deal.meddpiccScore * 0.20;
    totalWeight += 20;

    // Champion (15% weight)
    const championScore = deal.hasChampion ? 85 : 25;
    factors.push({
        name: "Champion Identified",
        score: championScore,
        weight: 15,
        impact: deal.hasChampion ? "positive" : "negative",
        description: deal.hasChampion ? "Internal advocate confirmed" : "No champion identified yet",
    });
    totalScore += championScore * 0.15;
    totalWeight += 15;

    // Economic Buyer (15% weight)
    const ebScore = deal.hasEconomicBuyer ? 80 : 30;
    factors.push({
        name: "Economic Buyer Engaged",
        score: ebScore,
        weight: 15,
        impact: deal.hasEconomicBuyer ? "positive" : "negative",
        description: deal.hasEconomicBuyer ? "Budget holder is engaged" : "Decision maker not yet engaged",
    });
    totalScore += ebScore * 0.15;
    totalWeight += 15;

    // Activity momentum (10% weight)
    const activityScore = deal.activityCount >= 10 ? 80 : deal.activityCount >= 5 ? 60 : deal.activityCount >= 2 ? 40 : 20;
    factors.push({
        name: "Activity Momentum",
        score: activityScore,
        weight: 10,
        impact: activityScore >= 60 ? "positive" : activityScore >= 40 ? "neutral" : "negative",
        description: `${deal.activityCount} activities logged`,
    });
    totalScore += activityScore * 0.10;
    totalWeight += 10;

    // Stakeholder coverage (10% weight)
    const stakeholderScore = deal.stakeholderCount >= 4 ? 85 : deal.stakeholderCount >= 2 ? 60 : 30;
    factors.push({
        name: "Stakeholder Coverage",
        score: stakeholderScore,
        weight: 10,
        impact: stakeholderScore >= 60 ? "positive" : "negative",
        description: `${deal.stakeholderCount} contacts mapped`,
    });
    totalScore += stakeholderScore * 0.10;
    totalWeight += 10;

    // Competition (5% weight - negative factor)
    const competitionScore = deal.competitorCount === 0 ? 90 : deal.competitorCount === 1 ? 70 : deal.competitorCount === 2 ? 50 : 30;
    factors.push({
        name: "Competitive Pressure",
        score: competitionScore,
        weight: 5,
        impact: competitionScore >= 70 ? "positive" : competitionScore >= 50 ? "neutral" : "negative",
        description: deal.competitorCount === 0 ? "No competitors identified" : `${deal.competitorCount} competitor(s) in play`,
    });
    totalScore += competitionScore * 0.05;
    totalWeight += 5;

    const probability = Math.round(totalScore);

    return { probability, factors };
}

function getProbabilityColor(prob: number): string {
    if (prob >= 70) return "#10b981";
    if (prob >= 50) return "#22c55e";
    if (prob >= 30) return "#f59e0b";
    return "#ef4444";
}

function getProbabilityLabel(prob: number): string {
    if (prob >= 80) return "Very Likely";
    if (prob >= 60) return "Likely";
    if (prob >= 40) return "Possible";
    if (prob >= 20) return "Unlikely";
    return "At Risk";
}

export function WinProbability({ deal }: WinProbabilityProps) {
    const [showDetails, setShowDetails] = useState(false);
    const { probability, factors } = calculateWinProbability(deal);
    const color = getProbabilityColor(probability);
    const label = getProbabilityLabel(probability);

    return (
        <div className="win-probability">
            <style jsx>{`
                .win-probability {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .probability-header {
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .probability-header:hover {
                    background: var(--bg-tertiary);
                }

                .probability-ring {
                    width: 80px;
                    height: 80px;
                    position: relative;
                }

                .probability-ring svg {
                    transform: rotate(-90deg);
                }

                .probability-ring-bg {
                    fill: none;
                    stroke: var(--bg-tertiary);
                    stroke-width: 8;
                }

                .probability-ring-progress {
                    fill: none;
                    stroke-width: 8;
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.5s ease;
                }

                .probability-value {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .probability-number {
                    font-size: 1.5rem;
                    font-weight: 700;
                    line-height: 1;
                }

                .probability-percent {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }

                .probability-info {
                    flex: 1;
                }

                .probability-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .probability-status {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .probability-hint {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                }

                .expand-btn {
                    color: var(--text-muted);
                    transition: transform 0.2s ease;
                }

                .expand-btn.expanded {
                    transform: rotate(180deg);
                }

                .probability-details {
                    padding: 0 20px 20px;
                    border-top: 1px solid var(--border);
                }

                .factors-title {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin: 16px 0 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .factor-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .factor-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .factor-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .factor-content {
                    flex: 1;
                    min-width: 0;
                }

                .factor-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }

                .factor-name {
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .factor-score {
                    font-size: 0.8rem;
                    font-weight: 600;
                    font-family: monospace;
                }

                .factor-bar {
                    height: 4px;
                    background: var(--bg-tertiary);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .factor-bar-fill {
                    height: 100%;
                    border-radius: 2px;
                    transition: width 0.3s ease;
                }

                .factor-description {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                .probability-footer {
                    padding: 12px 20px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.75rem;
                }

                .ai-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--text-muted);
                }

                .ai-badge svg {
                    width: 14px;
                    height: 14px;
                }

                .improve-link {
                    color: var(--primary-light);
                    cursor: pointer;
                }

                .improve-link:hover {
                    text-decoration: underline;
                }
            `}</style>

            <div className="probability-header" onClick={() => setShowDetails(!showDetails)}>
                <div className="probability-ring">
                    <svg viewBox="0 0 100 100">
                        <circle
                            className="probability-ring-bg"
                            cx="50"
                            cy="50"
                            r="42"
                        />
                        <circle
                            className="probability-ring-progress"
                            cx="50"
                            cy="50"
                            r="42"
                            stroke={color}
                            strokeDasharray={`${probability * 2.64} 264`}
                        />
                    </svg>
                    <div className="probability-value">
                        <span className="probability-number" style={{ color }}>{probability}</span>
                        <span className="probability-percent">%</span>
                    </div>
                </div>

                <div className="probability-info">
                    <div className="probability-label">Win Probability</div>
                    <div className="probability-status" style={{ color }}>{label}</div>
                    <div className="probability-hint">
                        Based on {factors.length} scoring factors
                    </div>
                </div>

                <svg
                    className={`expand-btn ${showDetails ? "expanded" : ""}`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {showDetails && (
                <div className="probability-details">
                    <div className="factors-title">Scoring Factors</div>
                    <div className="factor-list">
                        {factors.map((factor) => {
                            const factorColor = factor.impact === "positive" ? "#10b981" 
                                : factor.impact === "negative" ? "#ef4444" : "#f59e0b";
                            return (
                                <div key={factor.name} className="factor-item">
                                    <div 
                                        className="factor-indicator"
                                        style={{ background: factorColor }}
                                    />
                                    <div className="factor-content">
                                        <div className="factor-header">
                                            <span className="factor-name">{factor.name}</span>
                                            <span className="factor-score" style={{ color: factorColor }}>
                                                {factor.score}%
                                            </span>
                                        </div>
                                        <div className="factor-bar">
                                            <div 
                                                className="factor-bar-fill"
                                                style={{ 
                                                    width: `${factor.score}%`,
                                                    background: factorColor,
                                                }}
                                            />
                                        </div>
                                        <div className="factor-description">{factor.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="probability-footer">
                <div className="ai-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    AI-powered prediction
                </div>
                <span className="improve-link">How to improve →</span>
            </div>
        </div>
    );
}
