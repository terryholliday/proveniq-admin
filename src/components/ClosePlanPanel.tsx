"use client";

import { useState } from "react";
import {
    CheckCircle2,
    Circle,
    Clock,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Plus,
    Sparkles,
    Users,
    FileText,
    Shield,
    DollarSign,
    Star,
    Loader2,
    ExternalLink,
} from "lucide-react";

interface ClosePlanItem {
    id: string;
    title: string;
    description?: string;
    category?: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETE" | "BLOCKED" | "SKIPPED";
    dueDate?: string;
    owner?: { id: string; fullName: string };
}

interface ClosePlan {
    id: string;
    dealId: string;
    targetCloseDate?: string;
    riskSummary?: string;
    items: ClosePlanItem[];
}

// Demo close plan data
const DEMO_CLOSE_PLAN: ClosePlan = {
    id: "cp1",
    dealId: "d1",
    targetCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    riskSummary:
        "Economic buyer access not yet confirmed. Paper process needs mapping. Champion engagement strong but needs executive sponsor.",
    items: [
        {
            id: "cpi1",
            title: "Confirm Economic Buyer access",
            description: "Schedule meeting with CFO to validate decision authority and budget approval process",
            category: "stakeholder",
            status: "IN_PROGRESS",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            owner: { id: "u1", fullName: "Alex Johnson" },
        },
        {
            id: "cpi2",
            title: "Complete security questionnaire",
            description: "Respond to InfoSec requirements and submit SOC 2 documentation",
            category: "technical",
            status: "COMPLETE",
            owner: { id: "u2", fullName: "Sarah Chen" },
        },
        {
            id: "cpi3",
            title: "Map procurement process",
            description: "Document all required approvals, legal review timeline, and signature authority",
            category: "legal",
            status: "PENDING",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            owner: { id: "u1", fullName: "Alex Johnson" },
        },
        {
            id: "cpi4",
            title: "Build ROI business case",
            description: "Quantify expected savings and efficiency gains with customer metrics",
            category: "commercial",
            status: "COMPLETE",
            owner: { id: "u1", fullName: "Alex Johnson" },
        },
        {
            id: "cpi5",
            title: "Strengthen Champion coaching",
            description: "Prepare internal presentation deck for champion to present to leadership",
            category: "champion",
            status: "PENDING",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            owner: { id: "u1", fullName: "Alex Johnson" },
        },
        {
            id: "cpi6",
            title: "Draft MSA and order form",
            description: "Prepare contract documents for legal review",
            category: "legal",
            status: "BLOCKED",
            owner: { id: "u3", fullName: "Mike Ross" },
        },
    ],
};

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
    stakeholder: { icon: Users, label: "Stakeholder", color: "text-blue-400" },
    technical: { icon: Shield, label: "Technical", color: "text-purple-400" },
    legal: { icon: FileText, label: "Legal", color: "text-amber-400" },
    commercial: { icon: DollarSign, label: "Commercial", color: "text-green-400" },
    champion: { icon: Star, label: "Champion", color: "text-pink-400" },
};

const STATUS_CONFIG = {
    PENDING: { icon: Circle, color: "text-slate-400", bg: "bg-slate-500/20" },
    IN_PROGRESS: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/20" },
    COMPLETE: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20" },
    BLOCKED: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
    SKIPPED: { icon: Circle, color: "text-slate-500", bg: "bg-slate-600/20" },
};

function formatDaysUntil(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays}d`;
}

interface ClosePlanPanelProps {
    dealId: string;
    demoMode?: boolean;
    onGeneratePlan?: () => void;
}

export default function ClosePlanPanel({ dealId, demoMode = true, onGeneratePlan }: ClosePlanPanelProps) {
    const [plan, setPlan] = useState<ClosePlan | null>(demoMode ? DEMO_CLOSE_PLAN : null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleItem = (itemId: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };

    const updateItemStatus = async (itemId: string, newStatus: ClosePlanItem["status"]) => {
        if (!plan) return;

        // Optimistic update
        setPlan({
            ...plan,
            items: plan.items.map((item) =>
                item.id === itemId ? { ...item, status: newStatus } : item
            ),
        });

        if (!demoMode) {
            try {
                const { updateClosePlanItem } = await import("@/lib/api-client");
                await updateClosePlanItem(dealId, { itemId, status: newStatus });
            } catch (err) {
                console.error("Failed to update close plan item:", err);
            }
        }
    };

    const handleGeneratePlan = async () => {
        setGenerating(true);

        if (demoMode) {
            await new Promise((r) => setTimeout(r, 1500));
            setPlan(DEMO_CLOSE_PLAN);
        } else {
            try {
                const { generateClosePlan } = await import("@/lib/api-client");
                const result = await generateClosePlan(dealId);
                setPlan(result.data);
            } catch (err) {
                console.error("Failed to generate close plan:", err);
                setPlan(DEMO_CLOSE_PLAN);
            }
        }

        setGenerating(false);
        onGeneratePlan?.();
    };

    const completedCount = plan?.items.filter((i) => i.status === "COMPLETE").length || 0;
    const totalCount = plan?.items.length || 0;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (!plan) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Generate Close Plan</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                        AI will analyze this deal&apos;s MEDDPICC gaps, stakeholder coverage, and stage to create a
                        personalized close plan checklist.
                    </p>
                    <button
                        onClick={handleGeneratePlan}
                        disabled={generating}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing deal...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Close Plan
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Close Plan</h3>
                        {demoMode && (
                            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                                Demo
                            </span>
                        )}
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-white">{progressPercent}%</span>
                        <p className="text-xs text-slate-400">
                            {completedCount}/{totalCount} complete
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Risk summary */}
                {plan.riskSummary && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-amber-200 text-sm">{plan.riskSummary}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Items list */}
            <div className="divide-y divide-slate-700/50">
                {plan.items.map((item) => {
                    const statusConfig = STATUS_CONFIG[item.status];
                    const categoryConfig = item.category ? CATEGORY_CONFIG[item.category] : null;
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <div key={item.id} className="px-4 py-3 hover:bg-slate-700/20 transition-colors">
                            <div className="flex items-start gap-3">
                                {/* Status toggle */}
                                <button
                                    onClick={() =>
                                        updateItemStatus(
                                            item.id,
                                            item.status === "COMPLETE" ? "PENDING" : "COMPLETE"
                                        )
                                    }
                                    className={`mt-0.5 p-1 rounded-full ${statusConfig.bg} hover:opacity-80 transition-opacity`}
                                >
                                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleItem(item.id)}
                                            className="flex items-center gap-1 text-slate-400 hover:text-white"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                        <span
                                            className={`font-medium ${
                                                item.status === "COMPLETE"
                                                    ? "text-slate-500 line-through"
                                                    : "text-white"
                                            }`}
                                        >
                                            {item.title}
                                        </span>
                                    </div>

                                    {isExpanded && item.description && (
                                        <p className="text-slate-400 text-sm mt-2 ml-5">{item.description}</p>
                                    )}

                                    <div className="flex items-center gap-3 mt-2 ml-5">
                                        {categoryConfig && (
                                            <span
                                                className={`flex items-center gap-1 text-xs ${categoryConfig.color}`}
                                            >
                                                <categoryConfig.icon className="w-3 h-3" />
                                                {categoryConfig.label}
                                            </span>
                                        )}
                                        {item.owner && (
                                            <span className="text-xs text-slate-500">
                                                {item.owner.fullName}
                                            </span>
                                        )}
                                        {item.dueDate && item.status !== "COMPLETE" && (
                                            <span
                                                className={`text-xs ${
                                                    new Date(item.dueDate) < new Date()
                                                        ? "text-red-400"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                {formatDaysUntil(item.dueDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30 flex items-center justify-between">
                <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                    Add item
                </button>
                <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Export to Tasks
                </button>
            </div>
        </div>
    );
}
