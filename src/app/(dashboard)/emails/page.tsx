"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface Email {
    id: string;
    subject: string;
    from: { name: string; email: string };
    to: { name: string; email: string }[];
    date: string;
    preview: string;
    body: string;
    dealId?: string;
    dealName?: string;
    accountName?: string;
    direction: "inbound" | "outbound";
    tracked: boolean;
    opened?: boolean;
    openedAt?: string;
    clicked?: boolean;
}

const MOCK_EMAILS: Email[] = [
    {
        id: "1",
        subject: "Re: Proposal Review - Next Steps",
        from: { name: "Sarah Chen", email: "sarah.chen@acmecorp.com" },
        to: [{ name: "Terry Holliday", email: "terry@proveniq.com" }],
        date: new Date(Date.now() - 3600000).toISOString(),
        preview: "Thanks for sending over the revised proposal. I've shared it with our procurement team and we should have feedback by...",
        body: "Thanks for sending over the revised proposal. I've shared it with our procurement team and we should have feedback by end of week.\n\nA few questions came up during our internal review:\n1. Can you clarify the implementation timeline?\n2. What's included in the support package?\n3. Are there volume discounts available?\n\nLooking forward to discussing.\n\nBest,\nSarah",
        dealId: "deal-1",
        dealName: "Acme Corp Enterprise",
        accountName: "Acme Corporation",
        direction: "inbound",
        tracked: true,
    },
    {
        id: "2",
        subject: "Demo Recording & Follow-up Materials",
        from: { name: "Terry Holliday", email: "terry@proveniq.com" },
        to: [{ name: "Mike Johnson", email: "mike.j@techstart.io" }],
        date: new Date(Date.now() - 86400000).toISOString(),
        preview: "Hi Mike, Great demo today! As promised, here's the recording link and the materials we discussed...",
        body: "Hi Mike,\n\nGreat demo today! As promised, here's the recording link and the materials we discussed:\n\n📹 Demo Recording: [link]\n📄 Product Overview: [attachment]\n📊 ROI Calculator: [attachment]\n\nI'll follow up next week to schedule a technical deep-dive with your engineering team.\n\nBest regards,\nTerry",
        dealId: "deal-2",
        dealName: "TechStart Series A",
        accountName: "TechStart Inc",
        direction: "outbound",
        tracked: true,
        opened: true,
        openedAt: new Date(Date.now() - 82800000).toISOString(),
        clicked: true,
    },
    {
        id: "3",
        subject: "Contract Questions - Legal Review",
        from: { name: "Legal Team", email: "legal@globalbank.com" },
        to: [{ name: "Terry Holliday", email: "terry@proveniq.com" }],
        date: new Date(Date.now() - 172800000).toISOString(),
        preview: "Our legal team has completed the initial review of the MSA. Please find attached our redlined version with...",
        body: "Our legal team has completed the initial review of the MSA. Please find attached our redlined version with comments.\n\nKey areas requiring discussion:\n- Data residency requirements (Section 4.2)\n- Liability cap (Section 7.1)\n- Termination for convenience clause\n\nCan we schedule a call this week to work through these items?\n\nRegards,\nGlobalBank Legal",
        dealId: "deal-3",
        dealName: "GlobalBank Migration",
        accountName: "Global Bank",
        direction: "inbound",
        tracked: true,
    },
    {
        id: "4",
        subject: "Introduction - PROVENIQ Solutions",
        from: { name: "Terry Holliday", email: "terry@proveniq.com" },
        to: [{ name: "Jane Smith", email: "jsmith@retailmax.com" }],
        date: new Date(Date.now() - 259200000).toISOString(),
        preview: "Hi Jane, I hope this email finds you well. I'm reaching out because I noticed RetailMax is expanding...",
        body: "Hi Jane,\n\nI hope this email finds you well. I'm reaching out because I noticed RetailMax is expanding into new markets and thought our solution might be relevant.\n\nWe help retail companies like yours:\n• Reduce inventory shrinkage by 40%\n• Automate asset tracking\n• Generate compliance reports automatically\n\nWould you be open to a brief call to explore if there's a fit?\n\nBest,\nTerry",
        dealId: "deal-4",
        dealName: "RetailMax Expansion",
        accountName: "RetailMax",
        direction: "outbound",
        tracked: true,
        opened: false,
    },
];

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function EmailsPage() {
    const [emails] = useState<Email[]>(MOCK_EMAILS);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [filter, setFilter] = useState<"all" | "inbound" | "outbound">("all");
    const [showCompose, setShowCompose] = useState(false);

    const filteredEmails = emails.filter(e => {
        if (filter === "all") return true;
        return e.direction === filter;
    });

    const stats = {
        sent: emails.filter(e => e.direction === "outbound").length,
        received: emails.filter(e => e.direction === "inbound").length,
        opened: emails.filter(e => e.opened).length,
        openRate: Math.round((emails.filter(e => e.opened).length / emails.filter(e => e.direction === "outbound").length) * 100) || 0,
    };

    return (
        <>
            <style jsx global>{`
                .email-container {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    height: calc(100vh - 140px);
                    margin: 0 24px 24px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .email-list-panel {
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                }

                .email-list-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .email-filters {
                    display: flex;
                    gap: 8px;
                }

                .email-filter-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .email-filter-btn:hover {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                }

                .email-filter-btn.active {
                    background: var(--primary);
                    color: white;
                }

                .email-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .email-item {
                    padding: 16px;
                    border-bottom: 1px solid var(--border);
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .email-item:hover {
                    background: var(--bg-tertiary);
                }

                .email-item.selected {
                    background: rgba(99, 102, 241, 0.1);
                    border-left: 3px solid var(--primary);
                }

                .email-item-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }

                .email-sender {
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .email-direction {
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                }

                .email-direction.inbound {
                    background: rgba(59, 130, 246, 0.15);
                    color: #3b82f6;
                }

                .email-direction.outbound {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                }

                .email-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .email-subject {
                    font-size: 0.875rem;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .email-preview {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .email-deal {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 8px;
                    font-size: 0.7rem;
                    padding: 3px 8px;
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--primary-light);
                    border-radius: 4px;
                }

                .email-tracking {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }

                .tracking-badge {
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .tracking-badge.opened {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                }

                .tracking-badge.clicked {
                    background: rgba(139, 92, 246, 0.15);
                    color: #8b5cf6;
                }

                .tracking-badge.pending {
                    background: rgba(107, 114, 128, 0.15);
                    color: #6b7280;
                }

                /* Email Detail */
                .email-detail-panel {
                    display: flex;
                    flex-direction: column;
                }

                .email-detail-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border);
                }

                .email-detail-subject {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 16px;
                }

                .email-participants {
                    display: flex;
                    gap: 24px;
                    font-size: 0.875rem;
                }

                .participant-label {
                    color: var(--text-muted);
                    width: 40px;
                }

                .participant-value {
                    color: var(--text-primary);
                }

                .email-detail-body {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                }

                .email-body-content {
                    white-space: pre-wrap;
                    line-height: 1.7;
                    font-size: 0.9rem;
                }

                .email-detail-footer {
                    padding: 16px 24px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    gap: 12px;
                }

                .email-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--text-muted);
                }

                .email-empty-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                /* Stats Bar */
                .email-stats {
                    display: flex;
                    gap: 16px;
                    padding: 16px 24px;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border);
                    margin: 0 24px;
                    border-radius: 12px 12px 0 0;
                    border: 1px solid var(--border);
                    border-bottom: none;
                }

                .email-stat {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .email-stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .email-stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                /* Compose Modal */
                .compose-modal {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    width: 600px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    overflow: hidden;
                }

                .compose-header {
                    padding: 16px 20px;
                    background: var(--bg-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .compose-title {
                    font-weight: 600;
                }

                .compose-body {
                    padding: 16px 20px;
                }

                .compose-field {
                    display: flex;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid var(--border);
                }

                .compose-field label {
                    width: 60px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .compose-field input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }

                .compose-textarea {
                    width: 100%;
                    min-height: 200px;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    resize: none;
                    margin-top: 16px;
                    line-height: 1.6;
                }

                .compose-footer {
                    padding: 12px 20px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .compose-options {
                    display: flex;
                    gap: 12px;
                }

                .compose-option {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    cursor: pointer;
                }

                .compose-option input {
                    accent-color: var(--primary);
                }

                @media (max-width: 1024px) {
                    .email-container {
                        grid-template-columns: 1fr;
                    }

                    .email-detail-panel {
                        display: none;
                    }

                    .email-container.has-selected .email-list-panel {
                        display: none;
                    }

                    .email-container.has-selected .email-detail-panel {
                        display: flex;
                    }
                }
            `}</style>

            <Header
                title="Email Hub"
                subtitle="Track and manage deal-related emails"
                actions={
                    <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Compose
                    </button>
                }
            />

            {/* Stats */}
            <div className="email-stats">
                <div className="email-stat">
                    <div className="email-stat-value">{stats.sent}</div>
                    <div className="email-stat-label">Sent</div>
                </div>
                <div className="email-stat">
                    <div className="email-stat-value">{stats.received}</div>
                    <div className="email-stat-label">Received</div>
                </div>
                <div className="email-stat">
                    <div className="email-stat-value" style={{ color: "#10b981" }}>{stats.openRate}%</div>
                    <div className="email-stat-label">Open Rate</div>
                </div>
                <div className="email-stat">
                    <div className="email-stat-value">{stats.opened}</div>
                    <div className="email-stat-label">Opened</div>
                </div>
            </div>

            <div className={`email-container ${selectedEmail ? "has-selected" : ""}`}>
                {/* Email List */}
                <div className="email-list-panel">
                    <div className="email-list-header">
                        <div className="email-filters">
                            <button
                                className={`email-filter-btn ${filter === "all" ? "active" : ""}`}
                                onClick={() => setFilter("all")}
                            >
                                All
                            </button>
                            <button
                                className={`email-filter-btn ${filter === "inbound" ? "active" : ""}`}
                                onClick={() => setFilter("inbound")}
                            >
                                Received
                            </button>
                            <button
                                className={`email-filter-btn ${filter === "outbound" ? "active" : ""}`}
                                onClick={() => setFilter("outbound")}
                            >
                                Sent
                            </button>
                        </div>
                    </div>

                    <div className="email-list">
                        {filteredEmails.map((email) => (
                            <div
                                key={email.id}
                                className={`email-item ${selectedEmail?.id === email.id ? "selected" : ""}`}
                                onClick={() => setSelectedEmail(email)}
                            >
                                <div className="email-item-header">
                                    <span className="email-sender">
                                        {email.direction === "inbound" ? email.from.name : `To: ${email.to[0].name}`}
                                        <span className={`email-direction ${email.direction}`}>
                                            {email.direction === "inbound" ? "↓ In" : "↑ Out"}
                                        </span>
                                    </span>
                                    <span className="email-time">{formatDate(email.date)}</span>
                                </div>
                                <div className="email-subject">{email.subject}</div>
                                <div className="email-preview">{email.preview}</div>
                                
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    {email.dealName && (
                                        <span className="email-deal">💼 {email.dealName}</span>
                                    )}
                                    {email.direction === "outbound" && email.tracked && (
                                        <div className="email-tracking">
                                            {email.opened ? (
                                                <span className="tracking-badge opened">👁 Opened</span>
                                            ) : (
                                                <span className="tracking-badge pending">⏳ Pending</span>
                                            )}
                                            {email.clicked && (
                                                <span className="tracking-badge clicked">🔗 Clicked</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email Detail */}
                <div className="email-detail-panel">
                    {selectedEmail ? (
                        <>
                            <div className="email-detail-header">
                                <h2 className="email-detail-subject">{selectedEmail.subject}</h2>
                                <div className="email-participants">
                                    <div>
                                        <span className="participant-label">From:</span>
                                        <span className="participant-value">
                                            {selectedEmail.from.name} &lt;{selectedEmail.from.email}&gt;
                                        </span>
                                    </div>
                                </div>
                                <div className="email-participants" style={{ marginTop: 8 }}>
                                    <div>
                                        <span className="participant-label">To:</span>
                                        <span className="participant-value">
                                            {selectedEmail.to.map(t => `${t.name} <${t.email}>`).join(", ")}
                                        </span>
                                    </div>
                                </div>
                                <div className="email-participants" style={{ marginTop: 8 }}>
                                    <div>
                                        <span className="participant-label">Date:</span>
                                        <span className="participant-value">
                                            {new Date(selectedEmail.date).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                {selectedEmail.dealName && (
                                    <Link href={`/deals/${selectedEmail.dealId}`} className="email-deal" style={{ marginTop: 12 }}>
                                        💼 {selectedEmail.dealName} ({selectedEmail.accountName})
                                    </Link>
                                )}
                            </div>

                            <div className="email-detail-body">
                                <div className="email-body-content">{selectedEmail.body}</div>
                            </div>

                            <div className="email-detail-footer">
                                <button className="btn btn-primary">
                                    ↩ Reply
                                </button>
                                <button className="btn btn-secondary">
                                    ↩↩ Reply All
                                </button>
                                <button className="btn btn-secondary">
                                    ↪ Forward
                                </button>
                                {selectedEmail.dealId && (
                                    <button className="btn btn-secondary" style={{ marginLeft: "auto" }}>
                                        📌 Log to Deal
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="email-empty">
                            <div className="email-empty-icon">✉️</div>
                            <p>Select an email to view</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Compose Modal */}
            {showCompose && (
                <div className="compose-modal">
                    <div className="compose-header">
                        <span className="compose-title">New Email</span>
                        <button className="btn btn-ghost" onClick={() => setShowCompose(false)}>✕</button>
                    </div>
                    <div className="compose-body">
                        <div className="compose-field">
                            <label>To:</label>
                            <input type="text" placeholder="recipient@example.com" />
                        </div>
                        <div className="compose-field">
                            <label>Subject:</label>
                            <input type="text" placeholder="Email subject" />
                        </div>
                        <div className="compose-field">
                            <label>Deal:</label>
                            <select className="form-input" style={{ flex: 1, background: "transparent", border: "none" }}>
                                <option value="">Select a deal (optional)</option>
                                <option value="1">Acme Corp Enterprise</option>
                                <option value="2">TechStart Series A</option>
                            </select>
                        </div>
                        <textarea className="compose-textarea" placeholder="Write your message..." />
                    </div>
                    <div className="compose-footer">
                        <div className="compose-options">
                            <label className="compose-option">
                                <input type="checkbox" defaultChecked /> Track opens
                            </label>
                            <label className="compose-option">
                                <input type="checkbox" defaultChecked /> Track clicks
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-secondary" onClick={() => setShowCompose(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary">
                                Send Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
