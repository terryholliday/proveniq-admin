import { Header } from "@/components/Header";
import Link from "next/link";

// Mock accounts data
const accounts = [
    {
        id: "a1",
        name: "Acme Corporation",
        domain: "acme.com",
        industry: "Manufacturing",
        segment: "ENTERPRISE",
        region: "North America",
        dealCount: 3,
        totalPipeline: 750000,
    },
    {
        id: "a2",
        name: "TechStart Inc",
        domain: "techstart.io",
        industry: "Technology",
        segment: "MID",
        region: "North America",
        dealCount: 1,
        totalPipeline: 120000,
    },
    {
        id: "a3",
        name: "Global Logistics Ltd",
        domain: "globallogistics.com",
        industry: "Transportation",
        segment: "ENTERPRISE",
        region: "EMEA",
        dealCount: 2,
        totalPipeline: 480000,
    },
    {
        id: "a4",
        name: "FinanceHub",
        domain: "financehub.com",
        industry: "Financial Services",
        segment: "STRATEGIC",
        region: "North America",
        dealCount: 1,
        totalPipeline: 195000,
    },
    {
        id: "a5",
        name: "MegaMart",
        domain: "megamart.com",
        industry: "Retail",
        segment: "ENTERPRISE",
        region: "North America",
        dealCount: 1,
        totalPipeline: 340000,
    },
];

const segmentColors: Record<string, string> = {
    SMB: "badge-neutral",
    MID: "badge-info",
    ENTERPRISE: "badge-warning",
    STRATEGIC: "badge-success",
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function AccountsPage() {
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
                        <select className="form-input" style={{ width: "auto", minWidth: 150 }}>
                            <option value="">All Segments</option>
                            <option value="SMB">SMB</option>
                            <option value="MID">Mid-Market</option>
                            <option value="ENTERPRISE">Enterprise</option>
                            <option value="STRATEGIC">Strategic</option>
                        </select>

                        <select className="form-input" style={{ width: "auto", minWidth: 150 }}>
                            <option value="">All Industries</option>
                            <option value="Technology">Technology</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Financial Services">Financial Services</option>
                            <option value="Retail">Retail</option>
                        </select>

                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search accounts..."
                            style={{ width: "auto", minWidth: 200 }}
                        />
                    </div>
                </div>

                {/* Accounts Grid */}
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
                                <span className={`badge ${segmentColors[account.segment]}`}>
                                    {account.segment}
                                </span>
                            </div>

                            <Link href={`/accounts/${account.id}`} style={{ display: "block" }}>
                                <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{account.name}</h4>
                                <p className="text-muted" style={{ fontSize: "0.875rem" }}>{account.domain}</p>
                            </Link>

                            <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
                                <div>
                                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>Industry</span>
                                    <div style={{ fontSize: "0.875rem", marginTop: 2 }}>{account.industry}</div>
                                </div>
                                <div>
                                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>Region</span>
                                    <div style={{ fontSize: "0.875rem", marginTop: 2 }}>{account.region}</div>
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
                                    <div style={{ fontWeight: 600 }}>{account.dealCount}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>Pipeline</span>
                                    <div style={{ fontWeight: 600, color: "var(--success)" }}>
                                        {formatCurrency(account.totalPipeline)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
