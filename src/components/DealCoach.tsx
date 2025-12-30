"use client";

import { useState } from "react";

interface DealCoachProps {
    deal: {
        id: string;
        name: string;
        stage: string;
        forecast: string;
        amount: number;
        meddpiccScore: number;
        driScore: number;
        daysInStage: number;
        lastActivity: string;
        stakeholderCount: number;
        hasChampion: boolean;
        hasEconomicBuyer: boolean;
    };
}

interface Insight {
    id: string;
    type: "warning" | "opportunity" | "action" | "celebration";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    action?: string;
    actionLabel?: string;
}

function generateInsights(deal: DealCoachProps["deal"]): Insight[] {
    const insights: Insight[] = [];

    // MEDDPICC-based insights
    if (deal.meddpiccScore < 40) {
        insights.push({
            id: "low-meddpicc",
            type: "warning",
            title: "Deal qualification needs attention",
            description: `MEDDPICC score is ${deal.meddpiccScore}%. Focus on gathering more evidence to strengthen deal qualification.`,
            impact: "high",
            action: "meddpicc",
            actionLabel: "Review MEDDPICC",
        });
    }

    if (!deal.hasChampion) {
        insights.push({
            id: "no-champion",
            type: "warning",
            title: "No Champion identified",
            description: "Deals without an internal champion have 40% lower win rates. Identify and cultivate a champion who can advocate internally.",
            impact: "high",
            action: "stakeholders",
            actionLabel: "Add Champion",
        });
    }

    if (!deal.hasEconomicBuyer && deal.stage !== "INTAKE" && deal.stage !== "QUALIFIED") {
        insights.push({
            id: "no-eb",
            type: "warning",
            title: "Economic Buyer not engaged",
            description: "You're past discovery without engaging the Economic Buyer. Schedule a meeting to understand budget authority and approval process.",
            impact: "high",
            action: "task",
            actionLabel: "Schedule EB Meeting",
        });
    }

    // Stage-based insights
    if (deal.daysInStage > 14 && !["CLOSED_WON", "CLOSED_LOST"].includes(deal.stage)) {
        insights.push({
            id: "stalled",
            type: "warning",
            title: "Deal may be stalling",
            description: `This deal has been in ${deal.stage.replace(/_/g, " ")} for ${deal.daysInStage} days. Average is 10 days. Consider what's blocking progress.`,
            impact: "medium",
            action: "activity",
            actionLabel: "Log Activity",
        });
    }

    // Activity-based insights
    const daysSinceActivity = Math.floor((Date.now() - new Date(deal.lastActivity).getTime()) / 86400000);
    if (daysSinceActivity > 7) {
        insights.push({
            id: "no-recent-activity",
            type: "action",
            title: "Re-engage the prospect",
            description: `No activity in ${daysSinceActivity} days. Reach out to maintain momentum and stay top of mind.`,
            impact: "medium",
            action: "email",
            actionLabel: "Send Follow-up",
        });
    }

    // Stakeholder insights
    if (deal.stakeholderCount < 3 && deal.amount > 100000) {
        insights.push({
            id: "multi-thread",
            type: "opportunity",
            title: "Multi-thread this deal",
            description: "Large deals with multiple stakeholders have 2x higher close rates. Map additional contacts in the buying committee.",
            impact: "high",
            action: "stakeholders",
            actionLabel: "Add Contacts",
        });
    }

    // Positive reinforcement
    if (deal.meddpiccScore >= 70 && deal.driScore >= 70) {
        insights.push({
            id: "strong-deal",
            type: "celebration",
            title: "Strong deal fundamentals",
            description: "This deal is well-qualified with solid evidence. Focus on execution and closing.",
            impact: "low",
        });
    }

    // Stage-specific recommendations
    const stageRecommendations: Record<string, Insight> = {
        DISCOVERY: {
            id: "discovery-tip",
            type: "action",
            title: "Complete discovery framework",
            description: "Focus on uncovering pain points, business impact, and decision timeline. Document everything.",
            impact: "medium",
            action: "meddpicc",
            actionLabel: "Update Pain Points",
        },
        PROPOSAL: {
            id: "proposal-tip",
            type: "action",
            title: "Validate pricing before sending",
            description: "Confirm budget alignment with the Economic Buyer before submitting the formal proposal.",
            impact: "high",
            action: "call",
            actionLabel: "Schedule Pricing Call",
        },
        NEGOTIATION: {
            id: "negotiation-tip",
            type: "opportunity",
            title: "Understand their BATNA",
            description: "Know what happens if they don't buy. Understanding their alternatives gives you negotiation leverage.",
            impact: "medium",
        },
        COMMIT: {
            id: "commit-tip",
            type: "action",
            title: "Confirm close plan",
            description: "Document the exact steps, signatories, and timeline to get the contract signed.",
            impact: "high",
            action: "task",
            actionLabel: "Create Close Plan",
        },
    };

    if (stageRecommendations[deal.stage]) {
        insights.push(stageRecommendations[deal.stage]);
    }

    return insights.slice(0, 5); // Max 5 insights
}

const TYPE_CONFIG = {
    warning: { icon: "⚠️", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    opportunity: { icon: "💡", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
    action: { icon: "🎯", color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
    celebration: { icon: "🎉", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
};

const IMPACT_CONFIG = {
    high: { label: "High Impact", color: "#ef4444" },
    medium: { label: "Medium", color: "#f59e0b" },
    low: { label: "Low", color: "#6b7280" },
};

export function DealCoach({ deal }: DealCoachProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const insights = generateInsights(deal);

    if (insights.length === 0) return null;

    return (
        <div className="deal-coach">
            <style jsx>{`
                .deal-coach {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .coach-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .coach-header:hover {
                    background: rgba(99, 102, 241, 0.05);
                }

                .coach-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .coach-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .coach-label {
                    font-size: 0.7rem;
                    color: var(--primary-light);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .coach-name {
                    font-weight: 600;
                    font-size: 1rem;
                }

                .coach-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .insight-count {
                    background: var(--primary);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .expand-icon {
                    color: var(--text-muted);
                    transition: transform 0.2s ease;
                }

                .expand-icon.expanded {
                    transform: rotate(180deg);
                }

                .coach-body {
                    padding: 0 20px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .insight-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    gap: 14px;
                }

                .insight-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.125rem;
                    flex-shrink: 0;
                }

                .insight-content {
                    flex: 1;
                    min-width: 0;
                }

                .insight-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 6px;
                }

                .insight-title {
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .insight-impact {
                    font-size: 0.65rem;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .insight-description {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin-bottom: 12px;
                }

                .insight-action {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .insight-action:hover {
                    filter: brightness(1.1);
                }

                .coach-footer {
                    padding: 12px 20px;
                    border-top: 1px solid rgba(99, 102, 241, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .coach-cta {
                    color: var(--primary-light);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .coach-cta:hover {
                    text-decoration: underline;
                }
            `}</style>

            <div className="coach-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="coach-title">
                    <div className="coach-icon">🤖</div>
                    <div>
                        <div className="coach-label">AI Deal Coach</div>
                        <div className="coach-name">Recommendations for this deal</div>
                    </div>
                </div>
                <div className="coach-badge">
                    <span className="insight-count">{insights.length} insights</span>
                    <svg
                        className={`expand-icon ${isExpanded ? "expanded" : ""}`}
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </div>

            {isExpanded && (
                <>
                    <div className="coach-body">
                        {insights.map((insight) => {
                            const typeConfig = TYPE_CONFIG[insight.type];
                            const impactConfig = IMPACT_CONFIG[insight.impact];

                            return (
                                <div key={insight.id} className="insight-card">
                                    <div
                                        className="insight-icon"
                                        style={{ background: typeConfig.bg }}
                                    >
                                        {typeConfig.icon}
                                    </div>
                                    <div className="insight-content">
                                        <div className="insight-header">
                                            <span className="insight-title">{insight.title}</span>
                                            <span
                                                className="insight-impact"
                                                style={{
                                                    background: `${impactConfig.color}20`,
                                                    color: impactConfig.color,
                                                }}
                                            >
                                                {impactConfig.label}
                                            </span>
                                        </div>
                                        <p className="insight-description">{insight.description}</p>
                                        {insight.actionLabel && (
                                            <button
                                                className="insight-action"
                                                style={{ background: typeConfig.color, color: "white" }}
                                            >
                                                {insight.actionLabel} →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="coach-footer">
                        <span>Powered by PROVENIQ AI</span>
                        <span className="coach-cta">
                            Get more insights →
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
