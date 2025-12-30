"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Notification {
    id: string;
    type: "deal_alert" | "task_due" | "mention" | "stage_change" | "risk_alert" | "win" | "system";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    dealId?: string;
    dealName?: string;
    actionUrl?: string;
    actionLabel?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "risk_alert",
        title: "Deal at Risk",
        message: "Acme Corp Enterprise has been stuck in Proposal for 21 days",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        dealId: "deal-1",
        dealName: "Acme Corp Enterprise",
        actionUrl: "/deals/deal-1",
        actionLabel: "View Deal",
    },
    {
        id: "2",
        type: "task_due",
        title: "Task Overdue",
        message: "Follow up on proposal is overdue by 2 days",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        actionUrl: "/tasks",
        actionLabel: "View Tasks",
    },
    {
        id: "3",
        type: "win",
        title: "🎉 Deal Closed Won!",
        message: "TechStart Series A closed for $125,000",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        dealId: "deal-2",
        dealName: "TechStart Series A",
    },
    {
        id: "4",
        type: "stage_change",
        title: "Stage Updated",
        message: "GlobalBank Migration moved to Negotiation",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true,
        dealId: "deal-3",
        dealName: "GlobalBank Migration",
        actionUrl: "/deals/deal-3",
    },
    {
        id: "5",
        type: "mention",
        title: "You were mentioned",
        message: "Sarah mentioned you in a note on RetailMax deal",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        dealId: "deal-4",
        actionUrl: "/deals/deal-4",
    },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
    deal_alert: { icon: "⚡", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
    task_due: { icon: "⏰", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
    mention: { icon: "@", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" },
    stage_change: { icon: "→", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)" },
    risk_alert: { icon: "⚠️", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
    win: { icon: "🎉", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
    system: { icon: "ℹ️", color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)" },
};

function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <div className="notification-center" ref={panelRef}>
            <style jsx>{`
                .notification-center {
                    position: relative;
                }

                .notification-trigger {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .notification-trigger:hover {
                    border-color: var(--border-hover);
                    background: var(--bg-secondary);
                }

                .notification-trigger.has-unread {
                    border-color: var(--primary);
                }

                .notification-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    background: #ef4444;
                    border-radius: 9px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .notification-panel {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    width: 400px;
                    max-height: 500px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    z-index: 1000;
                }

                .panel-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .panel-title {
                    font-weight: 600;
                    font-size: 1rem;
                }

                .panel-actions {
                    display: flex;
                    gap: 12px;
                }

                .panel-action {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: color 0.15s ease;
                }

                .panel-action:hover {
                    color: var(--primary-light);
                }

                .panel-body {
                    max-height: 380px;
                    overflow-y: auto;
                }

                .notification-item {
                    display: flex;
                    gap: 12px;
                    padding: 14px 20px;
                    border-bottom: 1px solid var(--border);
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .notification-item:hover {
                    background: var(--bg-tertiary);
                }

                .notification-item:last-child {
                    border-bottom: none;
                }

                .notification-item.unread {
                    background: rgba(99, 102, 241, 0.05);
                }

                .notification-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 8px;
                    margin-bottom: 4px;
                }

                .notification-title {
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: var(--text-primary);
                }

                .notification-time {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                }

                .notification-message {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                }

                .notification-action {
                    display: inline-block;
                    margin-top: 8px;
                    font-size: 0.75rem;
                    color: var(--primary-light);
                    font-weight: 500;
                }

                .notification-action:hover {
                    text-decoration: underline;
                }

                .unread-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--primary);
                    flex-shrink: 0;
                    margin-top: 6px;
                }

                .empty-state {
                    padding: 48px 20px;
                    text-align: center;
                    color: var(--text-muted);
                }

                .empty-icon {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .panel-footer {
                    padding: 12px 20px;
                    border-top: 1px solid var(--border);
                    text-align: center;
                }

                .view-all {
                    font-size: 0.8rem;
                    color: var(--primary-light);
                    font-weight: 500;
                    cursor: pointer;
                }

                .view-all:hover {
                    text-decoration: underline;
                }
            `}</style>

            <button
                className={`notification-trigger ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <div className="panel-header">
                        <h3 className="panel-title">Notifications</h3>
                        <div className="panel-actions">
                            <span className="panel-action" onClick={markAllRead}>Mark all read</span>
                            <span className="panel-action" onClick={clearAll}>Clear all</span>
                        </div>
                    </div>

                    <div className="panel-body">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🔔</div>
                                <p>No notifications</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const typeConfig = TYPE_CONFIG[notification.type];
                                return (
                                    <div
                                        key={notification.id}
                                        className={`notification-item ${!notification.read ? "unread" : ""}`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div
                                            className="notification-icon"
                                            style={{ background: typeConfig.bg }}
                                        >
                                            {typeConfig.icon}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-header">
                                                <span className="notification-title">{notification.title}</span>
                                                <span className="notification-time">{formatTime(notification.timestamp)}</span>
                                            </div>
                                            <p className="notification-message">{notification.message}</p>
                                            {notification.actionUrl && notification.actionLabel && (
                                                <Link href={notification.actionUrl} className="notification-action">
                                                    {notification.actionLabel} →
                                                </Link>
                                            )}
                                        </div>
                                        {!notification.read && <div className="unread-dot" />}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="panel-footer">
                        <Link href="/notifications" className="view-all">
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
