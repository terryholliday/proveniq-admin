"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    status: "TODO" | "IN_PROGRESS" | "DONE" | "OVERDUE";
    type: "CALL" | "EMAIL" | "MEETING" | "FOLLOW_UP" | "DEMO" | "PROPOSAL" | "OTHER";
    dealId?: string;
    dealName?: string;
    accountName?: string;
    assignee: string;
    createdAt: string;
}

// Mock data for tasks
const MOCK_TASKS: Task[] = [
    {
        id: "1",
        title: "Follow up on proposal",
        description: "Send revised pricing based on last call",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: "HIGH",
        status: "TODO",
        type: "FOLLOW_UP",
        dealId: "deal-1",
        dealName: "Acme Corp Enterprise",
        accountName: "Acme Corporation",
        assignee: "Terry H.",
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Schedule demo with technical team",
        description: "Coordinate with SE for product demo",
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        priority: "HIGH",
        status: "TODO",
        type: "DEMO",
        dealId: "deal-2",
        dealName: "TechStart Series A",
        accountName: "TechStart Inc",
        assignee: "Terry H.",
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        title: "Send contract for review",
        description: "Legal has approved, send to customer",
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        priority: "HIGH",
        status: "OVERDUE",
        type: "PROPOSAL",
        dealId: "deal-3",
        dealName: "GlobalBank Migration",
        accountName: "Global Bank",
        assignee: "Terry H.",
        createdAt: new Date().toISOString(),
    },
    {
        id: "4",
        title: "Discovery call with CFO",
        description: "Understand budget timeline and approval process",
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        priority: "MEDIUM",
        status: "TODO",
        type: "CALL",
        dealId: "deal-4",
        dealName: "RetailMax Expansion",
        accountName: "RetailMax",
        assignee: "Terry H.",
        createdAt: new Date().toISOString(),
    },
    {
        id: "5",
        title: "Send case study materials",
        description: "Share relevant customer success stories",
        dueDate: new Date(Date.now() + 432000000).toISOString(),
        priority: "LOW",
        status: "TODO",
        type: "EMAIL",
        dealId: "deal-5",
        dealName: "HealthCare Plus",
        accountName: "HealthCare Plus",
        assignee: "Terry H.",
        createdAt: new Date().toISOString(),
    },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
    CALL: { icon: "📞", color: "#3b82f6", label: "Call" },
    EMAIL: { icon: "✉️", color: "#8b5cf6", label: "Email" },
    MEETING: { icon: "👥", color: "#10b981", label: "Meeting" },
    FOLLOW_UP: { icon: "🔄", color: "#f59e0b", label: "Follow Up" },
    DEMO: { icon: "🎬", color: "#ec4899", label: "Demo" },
    PROPOSAL: { icon: "📄", color: "#6366f1", label: "Proposal" },
    OTHER: { icon: "📌", color: "#6b7280", label: "Other" },
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
    HIGH: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
    MEDIUM: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
    LOW: { color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)" },
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === -1) return "Yesterday";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [filter, setFilter] = useState<"ALL" | "TODO" | "DONE" | "OVERDUE">("ALL");
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [showNewTask, setShowNewTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const filteredTasks = tasks.filter(task => {
        if (filter === "OVERDUE") return isOverdue(task.dueDate) && task.status !== "DONE";
        if (filter === "TODO") return task.status === "TODO" || task.status === "IN_PROGRESS";
        if (filter === "DONE") return task.status === "DONE";
        return true;
    }).filter(task => {
        if (typeFilter === "ALL") return true;
        return task.type === typeFilter;
    });

    const overdueTasks = tasks.filter(t => isOverdue(t.dueDate) && t.status !== "DONE");
    const todayTasks = tasks.filter(t => {
        const d = new Date(t.dueDate);
        const today = new Date();
        return d.toDateString() === today.toDateString() && t.status !== "DONE";
    });
    const upcomingTasks = tasks.filter(t => {
        const d = new Date(t.dueDate);
        const today = new Date();
        const week = new Date(Date.now() + 7 * 86400000);
        return d > today && d <= week && t.status !== "DONE";
    });

    const markComplete = (taskId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: "DONE" as const } : t));
    };

    const markIncomplete = (taskId: string) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: "TODO" as const } : t));
    };

    return (
        <>
            <style jsx global>{`
                .tasks-container {
                    padding: 24px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .tasks-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .task-stat {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .task-stat:hover {
                    border-color: var(--primary);
                }

                .task-stat.active {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .task-stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                }

                .task-stat-value.overdue {
                    color: #ef4444;
                }

                .task-stat-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 4px;
                }

                .tasks-content {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 24px;
                }

                .tasks-main {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .tasks-filters {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .task-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    gap: 16px;
                    transition: all 0.15s ease;
                    cursor: pointer;
                }

                .task-card:hover {
                    border-color: var(--border-hover);
                    transform: translateY(-1px);
                }

                .task-card.overdue {
                    border-left: 3px solid #ef4444;
                }

                .task-card.done {
                    opacity: 0.6;
                }

                .task-checkbox {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .task-checkbox:hover {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .task-checkbox.checked {
                    background: var(--success);
                    border-color: var(--success);
                    color: white;
                }

                .task-content {
                    flex: 1;
                    min-width: 0;
                }

                .task-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .task-title {
                    font-weight: 600;
                    font-size: 1rem;
                    color: var(--text-primary);
                }

                .task-card.done .task-title {
                    text-decoration: line-through;
                    color: var(--text-muted);
                }

                .task-badges {
                    display: flex;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .task-type-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                .task-priority-badge {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                .task-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-bottom: 12px;
                    line-height: 1.5;
                }

                .task-meta {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    font-size: 0.8rem;
                }

                .task-deal {
                    color: var(--primary-light);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .task-due {
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .task-due.overdue {
                    color: #ef4444;
                    font-weight: 600;
                }

                /* Sidebar */
                .tasks-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .sidebar-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .sidebar-card-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .sidebar-card-body {
                    padding: 12px;
                }

                .mini-task {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .mini-task:hover {
                    background: var(--bg-tertiary);
                }

                .mini-task-icon {
                    font-size: 1rem;
                }

                .mini-task-content {
                    flex: 1;
                    min-width: 0;
                }

                .mini-task-title {
                    font-size: 0.85rem;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .mini-task-meta {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }

                /* Calendar Preview */
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .calendar-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    border-radius: 6px;
                    cursor: pointer;
                }

                .calendar-day.header {
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.65rem;
                }

                .calendar-day.today {
                    background: var(--primary);
                    color: white;
                    font-weight: 600;
                }

                .calendar-day.has-tasks {
                    background: rgba(99, 102, 241, 0.2);
                }

                .calendar-day.has-overdue {
                    background: rgba(239, 68, 68, 0.2);
                }

                /* New Task Modal */
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
                    max-width: 540px;
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
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .modal-footer {
                    padding: 16px 20px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .type-selector {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                .type-option {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 12px 8px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .type-option:hover {
                    border-color: var(--primary);
                }

                .type-option.selected {
                    border-color: var(--primary);
                    background: rgba(99, 102, 241, 0.1);
                }

                .type-option-icon {
                    font-size: 1.25rem;
                }

                .type-option-label {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                .priority-selector {
                    display: flex;
                    gap: 8px;
                }

                .priority-option {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    text-align: center;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 500;
                    transition: all 0.15s ease;
                }

                .priority-option:hover {
                    border-color: var(--border-hover);
                }

                .priority-option.selected {
                    border-width: 2px;
                }

                @media (max-width: 1024px) {
                    .tasks-content {
                        grid-template-columns: 1fr;
                    }

                    .tasks-sidebar {
                        display: none;
                    }

                    .tasks-stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>

            <Header
                title="Tasks"
                subtitle={`${tasks.filter(t => t.status !== "DONE").length} open tasks`}
                actions={
                    <button className="btn btn-primary" onClick={() => setShowNewTask(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Task
                    </button>
                }
            />

            <div className="tasks-container">
                {/* Stats */}
                <div className="tasks-stats">
                    <div
                        className={`task-stat ${filter === "OVERDUE" ? "active" : ""}`}
                        onClick={() => setFilter(filter === "OVERDUE" ? "ALL" : "OVERDUE")}
                    >
                        <div className="task-stat-value overdue">{overdueTasks.length}</div>
                        <div className="task-stat-label">Overdue</div>
                    </div>
                    <div
                        className={`task-stat ${filter === "ALL" && typeFilter === "ALL" ? "active" : ""}`}
                        onClick={() => { setFilter("ALL"); setTypeFilter("ALL"); }}
                    >
                        <div className="task-stat-value">{todayTasks.length}</div>
                        <div className="task-stat-label">Due Today</div>
                    </div>
                    <div className="task-stat">
                        <div className="task-stat-value">{upcomingTasks.length}</div>
                        <div className="task-stat-label">This Week</div>
                    </div>
                    <div
                        className={`task-stat ${filter === "DONE" ? "active" : ""}`}
                        onClick={() => setFilter(filter === "DONE" ? "ALL" : "DONE")}
                    >
                        <div className="task-stat-value" style={{ color: "#10b981" }}>
                            {tasks.filter(t => t.status === "DONE").length}
                        </div>
                        <div className="task-stat-label">Completed</div>
                    </div>
                </div>

                <div className="tasks-content">
                    <div className="tasks-main">
                        {/* Filters */}
                        <div className="tasks-filters">
                            <select
                                className="form-input"
                                style={{ width: "auto" }}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="ALL">All Types</option>
                                {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                                    <option key={key} value={key}>{val.icon} {val.label}</option>
                                ))}
                            </select>
                            <select
                                className="form-input"
                                style={{ width: "auto" }}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                            >
                                <option value="ALL">All Tasks</option>
                                <option value="TODO">Open</option>
                                <option value="DONE">Completed</option>
                                <option value="OVERDUE">Overdue</option>
                            </select>
                        </div>

                        {/* Task List */}
                        {filteredTasks.length === 0 ? (
                            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
                                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>✓</div>
                                <p>No tasks match your filters</p>
                            </div>
                        ) : (
                            filteredTasks.map((task) => {
                                const typeConfig = TYPE_CONFIG[task.type];
                                const priorityConfig = PRIORITY_CONFIG[task.priority];
                                const taskOverdue = isOverdue(task.dueDate) && task.status !== "DONE";

                                return (
                                    <div
                                        key={task.id}
                                        className={`task-card ${taskOverdue ? "overdue" : ""} ${task.status === "DONE" ? "done" : ""}`}
                                        onClick={() => setSelectedTask(task)}
                                    >
                                        <div
                                            className={`task-checkbox ${task.status === "DONE" ? "checked" : ""}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                task.status === "DONE" ? markIncomplete(task.id) : markComplete(task.id);
                                            }}
                                        >
                                            {task.status === "DONE" && "✓"}
                                        </div>
                                        <div className="task-content">
                                            <div className="task-header">
                                                <span className="task-title">{task.title}</span>
                                                <div className="task-badges">
                                                    <span
                                                        className="task-type-badge"
                                                        style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
                                                    >
                                                        {typeConfig.icon} {typeConfig.label}
                                                    </span>
                                                    <span
                                                        className="task-priority-badge"
                                                        style={{ background: priorityConfig.bg, color: priorityConfig.color }}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            {task.description && (
                                                <p className="task-description">{task.description}</p>
                                            )}
                                            <div className="task-meta">
                                                {task.dealName && (
                                                    <Link
                                                        href={`/deals/${task.dealId}`}
                                                        className="task-deal"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        💼 {task.dealName}
                                                    </Link>
                                                )}
                                                <span className={`task-due ${taskOverdue ? "overdue" : ""}`}>
                                                    🕐 {formatDate(task.dueDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="tasks-sidebar">
                        {/* Overdue Alert */}
                        {overdueTasks.length > 0 && (
                            <div className="sidebar-card" style={{ borderColor: "rgba(239, 68, 68, 0.5)" }}>
                                <div className="sidebar-card-header" style={{ color: "#ef4444" }}>
                                    ⚠️ Overdue Tasks
                                    <span className="badge badge-danger">{overdueTasks.length}</span>
                                </div>
                                <div className="sidebar-card-body">
                                    {overdueTasks.slice(0, 3).map((task) => (
                                        <div key={task.id} className="mini-task" onClick={() => setSelectedTask(task)}>
                                            <span className="mini-task-icon">{TYPE_CONFIG[task.type].icon}</span>
                                            <div className="mini-task-content">
                                                <div className="mini-task-title">{task.title}</div>
                                                <div className="mini-task-meta" style={{ color: "#ef4444" }}>
                                                    {formatDate(task.dueDate)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Due Today */}
                        <div className="sidebar-card">
                            <div className="sidebar-card-header">
                                📅 Due Today
                                <span className="badge badge-info">{todayTasks.length}</span>
                            </div>
                            <div className="sidebar-card-body">
                                {todayTasks.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 16, fontSize: "0.85rem" }}>
                                        No tasks due today
                                    </p>
                                ) : (
                                    todayTasks.map((task) => (
                                        <div key={task.id} className="mini-task" onClick={() => setSelectedTask(task)}>
                                            <span className="mini-task-icon">{TYPE_CONFIG[task.type].icon}</span>
                                            <div className="mini-task-content">
                                                <div className="mini-task-title">{task.title}</div>
                                                <div className="mini-task-meta">{task.accountName}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Add */}
                        <div className="sidebar-card">
                            <div className="sidebar-card-header">⚡ Quick Add</div>
                            <div className="sidebar-card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                {Object.entries(TYPE_CONFIG).slice(0, 4).map(([key, val]) => (
                                    <button
                                        key={key}
                                        className="btn btn-secondary"
                                        style={{ fontSize: "0.75rem", padding: "8px 12px" }}
                                        onClick={() => setShowNewTask(true)}
                                    >
                                        {val.icon} {val.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Task Modal */}
            {showNewTask && (
                <div className="modal-overlay" onClick={() => setShowNewTask(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Task</h2>
                            <button className="btn btn-ghost" onClick={() => setShowNewTask(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Task Type</label>
                                <div className="type-selector">
                                    {Object.entries(TYPE_CONFIG).slice(0, 4).map(([key, val]) => (
                                        <div key={key} className="type-option">
                                            <span className="type-option-icon">{val.icon}</span>
                                            <span className="type-option-label">{val.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input type="text" className="form-input" placeholder="What needs to be done?" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description (optional)</label>
                                <textarea className="form-input" rows={2} placeholder="Add more details..." />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Due Date</label>
                                    <input type="date" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Related Deal</label>
                                    <select className="form-input">
                                        <option value="">None</option>
                                        <option value="1">Acme Corp Enterprise</option>
                                        <option value="2">TechStart Series A</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <div className="priority-selector">
                                    <div className="priority-option" style={{ borderColor: "#ef4444", color: "#ef4444" }}>High</div>
                                    <div className="priority-option selected" style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>Medium</div>
                                    <div className="priority-option" style={{ borderColor: "#6b7280", color: "#6b7280" }}>Low</div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowNewTask(false)}>Cancel</button>
                            <button className="btn btn-primary">Create Task</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
