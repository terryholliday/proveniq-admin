"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { fetchAccounts } from "@/lib/api-client";
import Link from "next/link";

interface Account {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    segment: string;
    region?: string;
    _count?: { contacts: number; deals: number };
}

const segmentColors: Record<string, string> = {
    SMB: "badge-neutral",
    MID: "badge-info",
    ENTERPRISE: "badge-warning",
    STRATEGIC: "badge-success",
};

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [segmentFilter, setSegmentFilter] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadAccounts() {
            try {
                setLoading(true);
                const res = await fetchAccounts({
                    segment: segmentFilter || undefined,
                    search: search || undefined,
                    limit: 50,
                });
                setAccounts(res.data || []);
            } catch (e) {
                console.error("Failed to load accounts:", e);
            } finally {
                setLoading(false);
            }
        }
        loadAccounts();
    }, [segmentFilter, search]);

    return (
        <>
            <Header
                title="Accounts"
                subtitle={`${accounts.length} accounts`}
                actions={
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Account
                    </button>
                }
            />

            <div className="page-content">
                {/* Filters */}
                <div className="card mb-4" style={{ padding: 16 }}>
                    <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
                        <select
                            className="form-input"
                            style={{ width: "auto", minWidth: 150 }}
                            value={segmentFilter}
                            onChange={(e) => setSegmentFilter(e.target.value)}
                        >
                            <option value="">All Segments</option>
                            <option value="SMB">SMB</option>
                            <option value="MID">Mid-Market</option>
                            <option value="ENTERPRISE">Enterprise</option>
                            <option value="STRATEGIC">Strategic</option>
                        </select>

                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search accounts..."
                            style={{ width: "auto", minWidth: 200 }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Accounts Grid */}
                {loading ? (
                    <div className="flex items-center justify-center" style={{ padding: 48 }}>
                        <div className="loading-spinner" />
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <p>No accounts found</p>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                        {accounts.map((account) => (
                            <div key={account.id} className="card" style={{ padding: 20 }}>
                                <div className="flex justify-between items-center mb-4">
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: "var(--radius-md)",
                                            background: "var(--bg-tertiary)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                            fontSize: "1.125rem",
                                            color: "var(--primary-light)",
                                        }}
                                    >
                                        {account.name.charAt(0)}
                                    </div>
                                    <span className={`badge ${segmentColors[account.segment] || "badge-neutral"}`}>
                                        {account.segment}
                                    </span>
                                </div>

                                <Link href={`/accounts/${account.id}`} style={{ display: "block" }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{account.name}</h4>
                                    <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                                        {account.domain || "No domain"}
                                    </p>
                                </Link>

                                <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
                                    <div>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>Industry</span>
                                        <div style={{ fontSize: "0.875rem", marginTop: 2 }}>
                                            {account.industry || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>Region</span>
                                        <div style={{ fontSize: "0.875rem", marginTop: 2 }}>
                                            {account.region || "-"}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        marginTop: 16,
                                        paddingTop: 16,
                                        borderTop: "1px solid var(--border)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <div>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>Deals</span>
                                        <div style={{ fontWeight: 600 }}>{account._count?.deals || 0}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>Contacts</span>
                                        <div style={{ fontWeight: 600 }}>{account._count?.contacts || 0}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
