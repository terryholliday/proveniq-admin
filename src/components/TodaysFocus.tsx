"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    Clock,
    Calendar,
    Bell,
    CheckCircle2,
    ArrowRight,
    Target,
    TrendingDown,
} from "lucide-react";

interface Task {
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    deal?: { id: string; name: string };
}

interface Deal {
    id: string;
    name: string;
    stage: string;
    closeDate?: string;
    amountMicros?: string;
    driScores?: Array<{ state: string; total: number }>;
    account?: { name: string };
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    deal?: { id: string; name: string };
}

interface TodaysFocusData {
    overdueTasks: Task[];
    overdueCount: number;
    dealsAtRisk: Deal[];
    atRiskCount: number;
    closingSoon: Deal[];
    closingSoonCount: number;
    notifications: Notification[];
    unreadCount: number;
}

const styles = {
    container: {
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden" as const,
    },
    header: {
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%)",
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    headerTitle: {
        fontSize: "1.125rem",
        fontWeight: 600,
        color: "var(--text-primary)",
        margin: 0,
    },
    notifBtn: {
        position: "relative" as const,
        padding: "8px",
        borderRadius: "var(--radius-md)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
    },
    notifBadge: {
        position: "absolute" as const,
        top: "0",
        right: "0",
        width: "16px",
        height: "16px",
        background: "var(--danger)",
        color: "white",
        fontSize: "10px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    tabsContainer: {
        display: "flex",
        borderBottom: "1px solid var(--border)",
    },
    tab: (active: boolean) => ({
        flex: 1,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "0.875rem",
        fontWeight: 500,
        background: active ? "var(--bg-tertiary)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        border: "none",
        borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
        cursor: "pointer",
        transition: "all 150ms ease",
    }),
    tabBadge: (type: string, count: number) => {
        let bg = "rgba(16, 185, 129, 0.15)";
        let color = "#10b981";
        if (type === "tasks" && count > 0) { bg = "rgba(239, 68, 68, 0.15)"; color = "#ef4444"; }
        if (type === "risks" && count > 0) { bg = "rgba(245, 158, 11, 0.15)"; color = "#f59e0b"; }
        if (type === "closing") { bg = "rgba(59, 130, 246, 0.15)"; color = "#3b82f6"; }
        return {
            padding: "2px 8px",
            fontSize: "0.75rem",
            fontWeight: 600,
            borderRadius: "10px",
            background: bg,
            color: color,
        };
    },
    content: {
        padding: "16px",
        minHeight: "240px",
        maxHeight: "400px",
        overflowY: "auto" as const,
    },
    taskCard: {
        padding: "14px 16px",
        background: "var(--bg-tertiary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        marginBottom: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        transition: "border-color 150ms ease",
    },
    taskTitle: {
        fontSize: "0.875rem",
        fontWeight: 500,
        color: "var(--text-primary)",
        marginBottom: "4px",
    },
    taskDeal: {
        fontSize: "0.75rem",
        color: "var(--primary-light)",
    },
    priorityBadge: (priority: string) => {
        let bg = "rgba(107, 114, 128, 0.15)";
        let color = "#9ca3af";
        if (priority === "URGENT") { bg = "rgba(239, 68, 68, 0.2)"; color = "#f87171"; }
        if (priority === "HIGH") { bg = "rgba(245, 158, 11, 0.2)"; color = "#fbbf24"; }
        if (priority === "MEDIUM") { bg = "rgba(59, 130, 246, 0.15)"; color = "#60a5fa"; }
        return {
            padding: "4px 10px",
            fontSize: "0.7rem",
            fontWeight: 600,
            borderRadius: "4px",
            background: bg,
            color: color,
            textTransform: "uppercase" as const,
        };
    },
    dueDate: (overdue: boolean) => ({
        fontSize: "0.75rem",
        color: overdue ? "#f87171" : "var(--text-muted)",
        marginTop: "6px",
    }),
    emptyState: {
        textAlign: "center" as const,
        padding: "40px 20px",
    },
    footer: {
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-tertiary)",
        textAlign: "center" as const,
    },
    footerLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.875rem",
        color: "var(--primary-light)",
        fontWeight: 500,
    },
};

const DEMO_DATA: TodaysFocusData = {
    overdueTasks: [
        {
            id: "t1",
            title: "Follow up with Sarah Chen on POV results",
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "HIGH",
            deal: { id: "d1", name: "Acme Corp Enterprise" },
        },
        {
            id: "t2",
            title: "Send security questionnaire to InfoSec",
            dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            priority: "URGENT",
            deal: { id: "d2", name: "TechFlow Systems" },
        },
    ],
    overdueCount: 2,
    dealsAtRisk: [
        {
            id: "d3",
            name: "GlobalRetail POS Upgrade",
            stage: "PROPOSAL",
            closeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            amountMicros: "450000000000",
            driScores: [{ state: "RED", total: 42 }],
            account: { name: "GlobalRetail Inc" },
        },
    ],
    atRiskCount: 1,
    closingSoon: [
        {
            id: "d1",
            name: "Acme Corp Enterprise",
            stage: "LEGAL",
            closeDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            amountMicros: "1200000000000",
            account: { name: "Acme Corporation" },
        },
        {
            id: "d4",
            name: "FinServ Compliance Suite",
            stage: "COMMIT",
            closeDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            amountMicros: "890000000000",
            account: { name: "FinServ Partners" },
        },
    ],
    closingSoonCount: 2,
    notifications: [
        {
            id: "n1",
            title: "Deal Stage Changed",
            message: "Acme Corp Enterprise moved to LEGAL",
            type: "STAGE_CHANGE",
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            deal: { id: "d1", name: "Acme Corp Enterprise" },
        },
        {
            id: "n2",
            title: "Deal At Risk",
            message: "GlobalRetail POS Upgrade DRI score dropped to RED",
            type: "DEAL_AT_RISK",
            read: false,
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            deal: { id: "d3", name: "GlobalRetail POS Upgrade" },
        },
    ],
    unreadCount: 2,
};

function formatCurrency(micros: string | undefined): string {
    if (!micros) return "$0";
    const amount = parseInt(micros) / 1_000_000;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
}

function formatDaysAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
}

function formatDaysUntil(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
}

interface TodaysFocusProps {
    demoMode?: boolean;
    userId?: string;
}

export default function TodaysFocus({ demoMode = true, userId }: TodaysFocusProps) {
    const [data, setData] = useState<TodaysFocusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"tasks" | "risks" | "closing">("tasks");

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            if (demoMode) {
                // Use demo data with slight delay for realism
                await new Promise((r) => setTimeout(r, 500));
                setData(DEMO_DATA);
            } else {
                // Fetch real data from API
                try {
                    const { fetchTodaysFocus } = await import("@/lib/api-client");
                    const result = await fetchTodaysFocus(userId || "");
                    setData(result);
                } catch (err) {
                    console.error("Failed to fetch today's focus:", err);
                    // Fallback to demo data
                    setData(DEMO_DATA);
                }
            }

            setLoading(false);
        }

        loadData();
    }, [demoMode, userId]);

    if (loading) {
        return (
            <div style={{ ...styles.container, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
                    <div className="loading-spinner" />
                    <span style={{ marginLeft: 8, color: "var(--text-muted)" }}>Loading...</span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const tabs = [
        { id: "tasks" as const, label: "My Tasks", count: data.overdueCount, Icon: Clock },
        { id: "risks" as const, label: "At Risk", count: data.atRiskCount, Icon: AlertTriangle },
        { id: "closing" as const, label: "Closing Soon", count: data.closingSoonCount, Icon: Calendar },
    ];

    const getIconColor = (tabId: string, count: number) => {
        if (tabId === "tasks") return count > 0 ? "#ef4444" : "#10b981";
        if (tabId === "risks") return count > 0 ? "#f59e0b" : "#10b981";
        return "#3b82f6";
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <Target style={{ width: 20, height: 20, color: "var(--primary)" }} />
                    <h2 style={styles.headerTitle}>Today&apos;s Focus</h2>
                </div>
                <button style={styles.notifBtn}>
                    <Bell style={{ width: 20, height: 20, color: "var(--text-muted)" }} />
                    {data.unreadCount > 0 && (
                        <span style={styles.notifBadge}>{data.unreadCount}</span>
                    )}
                </button>
            </div>

            {/* Tabs */}
            <div style={styles.tabsContainer}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={styles.tab(activeTab === tab.id)}
                    >
                        <tab.Icon style={{ width: 16, height: 16, color: getIconColor(tab.id, tab.count) }} />
                        <span>{tab.label}</span>
                        <span style={styles.tabBadge(tab.id, tab.count)}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={styles.content}>
                {activeTab === "tasks" && (
                    <div>
                        {data.overdueTasks.length === 0 ? (
                            <div style={styles.emptyState}>
                                <CheckCircle2 style={{ width: 48, height: 48, color: "#10b981", margin: "0 auto 12px" }} />
                                <p style={{ color: "#10b981", fontWeight: 500 }}>All caught up!</p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No pending tasks</p>
                            </div>
                        ) : (
                            data.overdueTasks.map((task) => (
                                <div key={task.id} style={styles.taskCard}>
                                    <div style={{ flex: 1 }}>
                                        <p style={styles.taskTitle}>{task.title}</p>
                                        {task.deal && (
                                            <Link href={`/deals/${task.deal.id}`} style={styles.taskDeal}>
                                                {task.deal.name}
                                            </Link>
                                        )}
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span style={styles.priorityBadge(task.priority)}>{task.priority}</span>
                                        <p style={styles.dueDate(new Date(task.dueDate) < new Date())}>
                                            {new Date(task.dueDate) < new Date()
                                                ? `Due in ${formatDaysUntil(task.dueDate)}`
                                                : `Due in ${formatDaysUntil(task.dueDate)}`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "risks" && (
                    <div>
                        {data.dealsAtRisk.length === 0 ? (
                            <div style={styles.emptyState}>
                                <CheckCircle2 style={{ width: 48, height: 48, color: "#10b981", margin: "0 auto 12px" }} />
                                <p style={{ color: "#10b981", fontWeight: 500 }}>Pipeline healthy!</p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No deals at risk</p>
                            </div>
                        ) : (
                            data.dealsAtRisk.map((deal) => (
                                <Link key={deal.id} href={`/deals/${deal.id}`} style={{ ...styles.taskCard, borderColor: "rgba(239, 68, 68, 0.3)", display: "block", textDecoration: "none" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={styles.taskTitle}>{deal.name}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{deal.account?.name}</p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.875rem" }}>
                                                {formatCurrency(deal.amountMicros)}
                                            </p>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 4 }}>
                                                <TrendingDown style={{ width: 12, height: 12, color: "#ef4444" }} />
                                                <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>
                                                    DRI {deal.driScores?.[0]?.total || "—"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "closing" && (
                    <div>
                        {data.closingSoon.length === 0 ? (
                            <div style={styles.emptyState}>
                                <Calendar style={{ width: 48, height: 48, color: "var(--text-muted)", margin: "0 auto 12px" }} />
                                <p style={{ color: "var(--text-muted)" }}>No deals closing soon</p>
                            </div>
                        ) : (
                            data.closingSoon.map((deal) => (
                                <Link
                                    key={deal.id}
                                    href={`/deals/${deal.id}`}
                                    style={{ ...styles.taskCard, display: "block", textDecoration: "none" }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={styles.taskTitle}>{deal.name}</p>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                                <span style={{ fontSize: "0.7rem", padding: "2px 8px", background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", borderRadius: 10 }}>
                                                    {deal.stage}
                                                </span>
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                    {deal.account?.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.875rem" }}>
                                                {formatCurrency(deal.amountMicros)}
                                            </p>
                                            <p style={{ color: "#3b82f6", fontSize: "0.75rem", marginTop: 4 }}>
                                                {deal.closeDate
                                                    ? formatDaysUntil(deal.closeDate)
                                                    : "No date"}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <Link href="/tasks" style={styles.footerLink}>
                    View all tasks
                    <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
            </div>
        </div>
    );
}
