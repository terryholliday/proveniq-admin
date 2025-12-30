"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    title: string;
    department?: string;
    accountId: string;
    accountName: string;
    avatar?: string;
    role?: "CHAMPION" | "ECONOMIC_BUYER" | "TECHNICAL_BUYER" | "BLOCKER" | "COACH" | "END_USER";
    influence: "HIGH" | "MEDIUM" | "LOW";
    sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    lastContacted?: string;
    linkedIn?: string;
    deals: { id: string; name: string; role: string }[];
}

const MOCK_CONTACTS: Contact[] = [
    {
        id: "1",
        name: "Sarah Chen",
        email: "sarah.chen@acmecorp.com",
        phone: "+1 555-0101",
        title: "VP of Operations",
        department: "Operations",
        accountId: "acc-1",
        accountName: "Acme Corporation",
        role: "CHAMPION",
        influence: "HIGH",
        sentiment: "POSITIVE",
        lastContacted: new Date(Date.now() - 86400000).toISOString(),
        linkedIn: "https://linkedin.com/in/sarahchen",
        deals: [{ id: "deal-1", name: "Acme Corp Enterprise", role: "CHAMPION" }],
    },
    {
        id: "2",
        name: "Michael Johnson",
        email: "michael.j@acmecorp.com",
        phone: "+1 555-0102",
        title: "CFO",
        department: "Finance",
        accountId: "acc-1",
        accountName: "Acme Corporation",
        role: "ECONOMIC_BUYER",
        influence: "HIGH",
        sentiment: "NEUTRAL",
        lastContacted: new Date(Date.now() - 604800000).toISOString(),
        deals: [{ id: "deal-1", name: "Acme Corp Enterprise", role: "ECONOMIC_BUYER" }],
    },
    {
        id: "3",
        name: "Emily Watson",
        email: "ewatson@techstart.io",
        phone: "+1 555-0201",
        title: "CTO",
        department: "Engineering",
        accountId: "acc-2",
        accountName: "TechStart Inc",
        role: "TECHNICAL_BUYER",
        influence: "HIGH",
        sentiment: "POSITIVE",
        lastContacted: new Date(Date.now() - 172800000).toISOString(),
        linkedIn: "https://linkedin.com/in/emilywatson",
        deals: [{ id: "deal-2", name: "TechStart Series A", role: "TECHNICAL_BUYER" }],
    },
    {
        id: "4",
        name: "James Miller",
        email: "jmiller@techstart.io",
        title: "CEO",
        department: "Executive",
        accountId: "acc-2",
        accountName: "TechStart Inc",
        role: "ECONOMIC_BUYER",
        influence: "HIGH",
        sentiment: "POSITIVE",
        deals: [{ id: "deal-2", name: "TechStart Series A", role: "ECONOMIC_BUYER" }],
    },
    {
        id: "5",
        name: "David Thompson",
        email: "dthompson@globalbank.com",
        phone: "+1 555-0301",
        title: "Director of IT",
        department: "IT",
        accountId: "acc-3",
        accountName: "Global Bank",
        role: "TECHNICAL_BUYER",
        influence: "MEDIUM",
        sentiment: "NEUTRAL",
        lastContacted: new Date(Date.now() - 259200000).toISOString(),
        deals: [{ id: "deal-3", name: "GlobalBank Migration", role: "TECHNICAL_BUYER" }],
    },
    {
        id: "6",
        name: "Lisa Anderson",
        email: "landerson@globalbank.com",
        title: "SVP Technology",
        department: "Technology",
        accountId: "acc-3",
        accountName: "Global Bank",
        role: "CHAMPION",
        influence: "HIGH",
        sentiment: "POSITIVE",
        deals: [{ id: "deal-3", name: "GlobalBank Migration", role: "CHAMPION" }],
    },
    {
        id: "7",
        name: "Robert Brown",
        email: "rbrown@globalbank.com",
        title: "CISO",
        department: "Security",
        accountId: "acc-3",
        accountName: "Global Bank",
        role: "BLOCKER",
        influence: "HIGH",
        sentiment: "NEGATIVE",
        deals: [{ id: "deal-3", name: "GlobalBank Migration", role: "BLOCKER" }],
    },
];

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    CHAMPION: { label: "Champion", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", icon: "⭐" },
    ECONOMIC_BUYER: { label: "Economic Buyer", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", icon: "💰" },
    TECHNICAL_BUYER: { label: "Technical Buyer", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", icon: "🔧" },
    BLOCKER: { label: "Blocker", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", icon: "🚫" },
    COACH: { label: "Coach", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", icon: "🎯" },
    END_USER: { label: "End User", color: "#6b7280", bg: "rgba(107, 114, 128, 0.15)", icon: "👤" },
};

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    POSITIVE: { label: "Positive", color: "#10b981", icon: "😊" },
    NEUTRAL: { label: "Neutral", color: "#f59e0b", icon: "😐" },
    NEGATIVE: { label: "Negative", color: "#ef4444", icon: "😟" },
};

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

export default function ContactsPage() {
    const [contacts] = useState<Contact[]>(MOCK_CONTACTS);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "list" | "orgchart">("grid");
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = !search || 
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.accountName.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || c.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Group by account for org chart
    const accountGroups = contacts.reduce((acc, contact) => {
        if (!acc[contact.accountId]) {
            acc[contact.accountId] = {
                accountName: contact.accountName,
                contacts: [],
            };
        }
        acc[contact.accountId].contacts.push(contact);
        return acc;
    }, {} as Record<string, { accountName: string; contacts: Contact[] }>);

    return (
        <>
            <style jsx global>{`
                .contacts-container {
                    padding: 24px;
                    max-width: 1600px;
                    margin: 0 auto;
                }

                .contacts-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .search-input {
                    flex: 1;
                    min-width: 250px;
                    position: relative;
                }

                .search-input input {
                    width: 100%;
                    padding-left: 40px;
                }

                .search-input svg {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .view-toggle {
                    display: flex;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    padding: 4px;
                }

                .view-toggle button {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    transition: all 0.15s ease;
                }

                .view-toggle button.active {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }

                /* Grid View */
                .contacts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 16px;
                }

                .contact-card {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 20px;
                    transition: all 0.15s ease;
                    cursor: pointer;
                }

                .contact-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                }

                .contact-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .contact-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.125rem;
                    color: white;
                    flex-shrink: 0;
                }

                .contact-info {
                    flex: 1;
                    min-width: 0;
                }

                .contact-name {
                    font-weight: 600;
                    font-size: 1rem;
                    margin-bottom: 2px;
                }

                .contact-title {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }

                .contact-account {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .contact-badges {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 16px;
                }

                .contact-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                .contact-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-top: 12px;
                    border-top: 1px solid var(--border);
                }

                .contact-detail {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }

                .contact-detail svg {
                    width: 16px;
                    height: 16px;
                    color: var(--text-muted);
                }

                .contact-deals {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--border);
                }

                .contact-deals-title {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 8px;
                }

                .deal-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    background: rgba(99, 102, 241, 0.1);
                    color: var(--primary-light);
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    margin-right: 6px;
                    margin-bottom: 6px;
                }

                /* Org Chart View */
                .org-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .org-account {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .org-account-header {
                    padding: 16px 20px;
                    background: var(--bg-tertiary);
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .org-account-name {
                    font-weight: 600;
                    font-size: 1rem;
                }

                .org-account-count {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .org-contacts {
                    padding: 20px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .org-contact {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    min-width: 250px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .org-contact:hover {
                    background: rgba(99, 102, 241, 0.1);
                }

                .org-avatar {
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
                }

                .org-info {
                    flex: 1;
                }

                .org-name {
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .org-title {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .org-role {
                    font-size: 0.65rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                /* Stats */
                .contacts-stats {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .contact-stat {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                }

                .contact-stat-icon {
                    font-size: 1.5rem;
                    margin-bottom: 8px;
                }

                .contact-stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .contact-stat-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                /* Contact Modal */
                .contact-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }

                .contact-modal {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    width: 90%;
                    max-width: 500px;
                    overflow: hidden;
                }

                .contact-modal-header {
                    padding: 24px;
                    text-align: center;
                    border-bottom: 1px solid var(--border);
                }

                .modal-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.5rem;
                    color: white;
                    margin: 0 auto 16px;
                }

                .modal-name {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .modal-title {
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }

                .contact-modal-body {
                    padding: 24px;
                }

                .modal-section {
                    margin-bottom: 20px;
                }

                .modal-section-title {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                }

                .modal-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 0;
                    border-bottom: 1px solid var(--border);
                }

                .modal-row:last-child {
                    border-bottom: none;
                }

                .modal-row-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: var(--bg-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-row-value {
                    flex: 1;
                    font-size: 0.9rem;
                }

                .contact-modal-footer {
                    padding: 16px 24px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    gap: 12px;
                }

                @media (max-width: 768px) {
                    .contacts-stats {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .contacts-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <Header
                title="Contacts"
                subtitle={`${contacts.length} contacts across ${Object.keys(accountGroups).length} accounts`}
                actions={
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Contact
                    </button>
                }
            />

            <div className="contacts-container">
                {/* Stats */}
                <div className="contacts-stats">
                    <div className="contact-stat">
                        <div className="contact-stat-icon">⭐</div>
                        <div className="contact-stat-value">{contacts.filter(c => c.role === "CHAMPION").length}</div>
                        <div className="contact-stat-label">Champions</div>
                    </div>
                    <div className="contact-stat">
                        <div className="contact-stat-icon">💰</div>
                        <div className="contact-stat-value">{contacts.filter(c => c.role === "ECONOMIC_BUYER").length}</div>
                        <div className="contact-stat-label">Economic Buyers</div>
                    </div>
                    <div className="contact-stat">
                        <div className="contact-stat-icon">🔧</div>
                        <div className="contact-stat-value">{contacts.filter(c => c.role === "TECHNICAL_BUYER").length}</div>
                        <div className="contact-stat-label">Technical Buyers</div>
                    </div>
                    <div className="contact-stat">
                        <div className="contact-stat-icon">🚫</div>
                        <div className="contact-stat-value" style={{ color: "#ef4444" }}>{contacts.filter(c => c.role === "BLOCKER").length}</div>
                        <div className="contact-stat-label">Blockers</div>
                    </div>
                    <div className="contact-stat">
                        <div className="contact-stat-icon">😊</div>
                        <div className="contact-stat-value" style={{ color: "#10b981" }}>{contacts.filter(c => c.sentiment === "POSITIVE").length}</div>
                        <div className="contact-stat-label">Positive Sentiment</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="contacts-toolbar">
                    <div className="search-input">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-input"
                        style={{ width: "auto" }}
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">All Roles</option>
                        {Object.entries(ROLE_CONFIG).map(([key, val]) => (
                            <option key={key} value={key}>{val.icon} {val.label}</option>
                        ))}
                    </select>

                    <div className="view-toggle">
                        <button
                            className={viewMode === "grid" ? "active" : ""}
                            onClick={() => setViewMode("grid")}
                        >
                            Grid
                        </button>
                        <button
                            className={viewMode === "orgchart" ? "active" : ""}
                            onClick={() => setViewMode("orgchart")}
                        >
                            Org Chart
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === "grid" && (
                    <div className="contacts-grid">
                        {filteredContacts.map((contact) => {
                            const roleConfig = contact.role ? ROLE_CONFIG[contact.role] : null;
                            const sentimentConfig = contact.sentiment ? SENTIMENT_CONFIG[contact.sentiment] : null;

                            return (
                                <div
                                    key={contact.id}
                                    className="contact-card"
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    <div className="contact-header">
                                        <div className="contact-avatar">
                                            {getInitials(contact.name)}
                                        </div>
                                        <div className="contact-info">
                                            <div className="contact-name">{contact.name}</div>
                                            <div className="contact-title">{contact.title}</div>
                                            <div className="contact-account">{contact.accountName}</div>
                                        </div>
                                    </div>

                                    <div className="contact-badges">
                                        {roleConfig && (
                                            <span
                                                className="contact-badge"
                                                style={{ background: roleConfig.bg, color: roleConfig.color }}
                                            >
                                                {roleConfig.icon} {roleConfig.label}
                                            </span>
                                        )}
                                        {sentimentConfig && (
                                            <span
                                                className="contact-badge"
                                                style={{ background: `${sentimentConfig.color}15`, color: sentimentConfig.color }}
                                            >
                                                {sentimentConfig.icon} {sentimentConfig.label}
                                            </span>
                                        )}
                                    </div>

                                    <div className="contact-details">
                                        <div className="contact-detail">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                            {contact.email}
                                        </div>
                                        {contact.phone && (
                                            <div className="contact-detail">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                                </svg>
                                                {contact.phone}
                                            </div>
                                        )}
                                        {contact.lastContacted && (
                                            <div className="contact-detail">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <polyline points="12 6 12 12 16 14" />
                                                </svg>
                                                Last contact: {formatDate(contact.lastContacted)}
                                            </div>
                                        )}
                                    </div>

                                    {contact.deals.length > 0 && (
                                        <div className="contact-deals">
                                            <div className="contact-deals-title">Related Deals</div>
                                            {contact.deals.map((deal) => (
                                                <Link key={deal.id} href={`/deals/${deal.id}`} className="deal-tag">
                                                    💼 {deal.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Org Chart View */}
                {viewMode === "orgchart" && (
                    <div className="org-chart">
                        {Object.entries(accountGroups).map(([accountId, group]) => (
                            <div key={accountId} className="org-account">
                                <div className="org-account-header">
                                    <span className="org-account-name">🏢 {group.accountName}</span>
                                    <span className="org-account-count">{group.contacts.length} contacts</span>
                                </div>
                                <div className="org-contacts">
                                    {group.contacts.map((contact) => {
                                        const roleConfig = contact.role ? ROLE_CONFIG[contact.role] : null;
                                        return (
                                            <div
                                                key={contact.id}
                                                className="org-contact"
                                                onClick={() => setSelectedContact(contact)}
                                            >
                                                <div className="org-avatar">{getInitials(contact.name)}</div>
                                                <div className="org-info">
                                                    <div className="org-name">{contact.name}</div>
                                                    <div className="org-title">{contact.title}</div>
                                                </div>
                                                {roleConfig && (
                                                    <span
                                                        className="org-role"
                                                        style={{ background: roleConfig.bg, color: roleConfig.color }}
                                                    >
                                                        {roleConfig.icon}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            {selectedContact && (
                <div className="contact-modal-overlay" onClick={() => setSelectedContact(null)}>
                    <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="contact-modal-header">
                            <div className="modal-avatar">{getInitials(selectedContact.name)}</div>
                            <div className="modal-name">{selectedContact.name}</div>
                            <div className="modal-title">{selectedContact.title} at {selectedContact.accountName}</div>
                            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                                {selectedContact.role && ROLE_CONFIG[selectedContact.role] && (
                                    <span
                                        className="contact-badge"
                                        style={{
                                            background: ROLE_CONFIG[selectedContact.role].bg,
                                            color: ROLE_CONFIG[selectedContact.role].color,
                                        }}
                                    >
                                        {ROLE_CONFIG[selectedContact.role].icon} {ROLE_CONFIG[selectedContact.role].label}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="contact-modal-body">
                            <div className="modal-section">
                                <div className="modal-section-title">Contact Info</div>
                                <div className="modal-row">
                                    <div className="modal-row-icon">✉️</div>
                                    <div className="modal-row-value">{selectedContact.email}</div>
                                </div>
                                {selectedContact.phone && (
                                    <div className="modal-row">
                                        <div className="modal-row-icon">📞</div>
                                        <div className="modal-row-value">{selectedContact.phone}</div>
                                    </div>
                                )}
                                {selectedContact.linkedIn && (
                                    <div className="modal-row">
                                        <div className="modal-row-icon">💼</div>
                                        <div className="modal-row-value">
                                            <a href={selectedContact.linkedIn} target="_blank" style={{ color: "var(--primary-light)" }}>
                                                LinkedIn Profile
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedContact.deals.length > 0 && (
                                <div className="modal-section">
                                    <div className="modal-section-title">Related Deals</div>
                                    {selectedContact.deals.map((deal) => (
                                        <Link key={deal.id} href={`/deals/${deal.id}`} className="deal-tag">
                                            💼 {deal.name} ({deal.role.replace(/_/g, " ")})
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="contact-modal-footer">
                            <button className="btn btn-secondary" style={{ flex: 1 }}>
                                ✉️ Email
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1 }}>
                                📞 Call
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }}>
                                📝 Log Activity
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
