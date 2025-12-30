"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DemoModeToggle from "./DemoModeToggle";

// Icons (inline SVG for simplicity)
const icons = {
    dashboard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    deals: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
        </svg>
    ),
    accounts: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
            <path d="M3 21h18" />
            <path d="M9 7h1" />
            <path d="M9 11h1" />
            <path d="M9 15h1" />
            <path d="M14 7h1" />
            <path d="M14 11h1" />
            <path d="M14 15h1" />
        </svg>
    ),
    contacts: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
    users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    enforcement: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    ),
    reports: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
        </svg>
    ),
};

interface NavItem {
    label: string;
    href: string;
    icon: keyof typeof icons;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navigation: NavSection[] = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
            { label: "Reports", href: "/reports", icon: "reports" },
            { label: "Tasks", href: "/tasks", icon: "dashboard" },
            { label: "Simulator", href: "/simulator", icon: "reports" },
        ],
    },
    {
        title: "Pipeline",
        items: [
            { label: "Pipeline", href: "/pipeline", icon: "deals" },
            { label: "Deals", href: "/deals", icon: "deals" },
            { label: "Accounts", href: "/accounts", icon: "accounts" },
            { label: "Contacts", href: "/contacts", icon: "contacts" },
            { label: "Emails", href: "/emails", icon: "contacts" },
        ],
    },
    {
        title: "Governance",
        items: [
            { label: "Enforcement", href: "/enforcement", icon: "enforcement" },
            { label: "Team", href: "/team", icon: "users" },
        ],
    },
    {
        title: "System",
        items: [
            { label: "Settings", href: "/settings", icon: "settings" },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z" />
                    </svg>
                    PROVENIQ Sales
                </div>
            </div>

            <nav className="sidebar-nav">
                {navigation.map((section) => (
                    <div key={section.title} className="nav-section">
                        <div className="nav-section-title">{section.title}</div>
                        {section.items.map((item) => {
                            const isActive = pathname?.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive ? "active" : ""}`}
                                >
                                    {icons[item.icon]}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                {/* Demo Mode Toggle */}
                <div style={{ marginBottom: 16 }}>
                    <DemoModeToggle />
                </div>

                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                        }}
                    >
                        TH
                    </div>
                    <div>
                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>Terry H.</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Founder</div>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ width: "100%", justifyContent: "flex-start" }}
                    onClick={async () => {
                        const { createClient } = await import("@/lib/supabase/client");
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        window.location.href = "/login";
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
