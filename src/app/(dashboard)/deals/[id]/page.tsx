import { Header } from "@/components/Header";
import Link from "next/link";

// Mock deal data
const deal = {
    id: "1",
    name: "Acme Corp Enterprise License",
    account: { id: "a1", name: "Acme Corporation", domain: "acme.com", segment: "ENTERPRISE" },
    stage: "POV",
    forecast: "COMMIT",
    amount: 450000,
    currency: "USD",
    termMonths: 36,
    closeDate: "2025-02-15",
    owner: { id: "u1", name: "Terry H.", email: "terry@proveniq.com" },
    se: { id: "u2", name: "Alex K." },
    enforcementState: "OPEN",
    productMix: ["ClaimsIQ", "Ops", "Capital"],
    dri: { state: "GREEN", score: 85 },
    createdAt: "2024-11-15",
};

const meddpicc = [
    { category: "METRICS", status: "BUYER_CONFIRMED", notes: "20% reduction in claims processing time" },
    { category: "ECONOMIC_BUYER", status: "EVIDENCED", notes: "CFO Sarah Chen confirmed" },
    { category: "DECISION_CRITERIA", status: "EVIDENCED", notes: "Security, integration, pricing" },
    { category: "DECISION_PROCESS", status: "CLAIMED", notes: "Eval → Legal → Procurement → Sign" },
    { category: "PAPER_PROCESS", status: "MISSING", notes: null },
    { category: "CHAMPION", status: "BUYER_CONFIRMED", notes: "VP Ops Mike Johnson" },
    { category: "COMPETITION", status: "EVIDENCED", notes: "Incumbent: legacy system, Competitor: TrustCorp" },
];

const stakeholders = [
    { name: "Sarah Chen", title: "CFO", role: "ECONOMIC_BUYER", authority: 3 },
    { name: "Mike Johnson", title: "VP Operations", role: "CHAMPION", authority: 2 },
    { name: "Lisa Park", title: "Director IT", role: "TECH_EVAL", authority: 1 },
    { name: "David Lee", title: "Legal Counsel", role: "LEGAL", authority: 2 },
];

const activities = [
    { type: "MEETING", date: "2025-01-10", summary: "POV kickoff meeting with stakeholders" },
    { type: "CALL", date: "2025-01-08", summary: "Discovery call with CFO - confirmed budget" },
    { type: "EMAIL", date: "2025-01-05", summary: "Sent proposal document" },
    { type: "NOTE", date: "2025-01-03", summary: "Competitor analysis completed" },
];

const stageColors: Record<string, string> = {
    POV: "stage-pov",
    PROPOSAL: "stage-proposal",
    LEGAL: "stage-legal",
};

const statusColors: Record<string, string> = {
    MISSING: "badge-danger",
    CLAIMED: "badge-warning",
    EVIDENCED: "badge-info",
    BUYER_CONFIRMED: "badge-success",
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    }).format(amount);
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <>
            <Header
                title={deal.name}
                subtitle={`${deal.account.name} · ${formatCurrency(deal.amount)}`}
                actions={
                    <div className="flex gap-2">
                        <button className="btn btn-secondary">Edit</button>
                        <button className="btn btn-primary">Advance Stage</button>
                    </div>
                }
            />

            <div className="page-content">
                {/* Top Info Bar */}
                <div className="card mb-4" style={{ padding: 16 }}>
                    <div className="flex gap-6" style={{ flexWrap: "wrap" }}>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Stage</span>
                            <div className="mt-2">
                                <span className={`badge ${stageColors[deal.stage] || "badge-neutral"}`}>
                                    {deal.stage}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Forecast</span>
                            <div className="mt-2">
                                <span className="badge badge-success">{deal.forecast}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Amount</span>
                            <div style={{ fontWeight: 700, fontSize: "1.125rem", marginTop: 2 }}>
                                {formatCurrency(deal.amount)}
                            </div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Term</span>
                            <div style={{ fontWeight: 500, marginTop: 4 }}>{deal.termMonths} months</div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Close Date</span>
                            <div style={{ fontWeight: 500, marginTop: 4 }}>{deal.closeDate}</div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>DRI</span>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`dri-indicator dri-${deal.dri.state.toLowerCase()}`} />
                                <span style={{ fontWeight: 600 }}>{deal.dri.score}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Enforcement</span>
                            <div className="mt-2">
                                <span className={`badge ${deal.enforcementState === "OPEN" ? "badge-success" : "badge-danger"}`}>
                                    {deal.enforcementState}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                    {/* Left Column */}
                    <div>
                        {/* MEDDPICC */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3 className="card-title">MEDDPICC Evidence</h3>
                                <button className="btn btn-ghost btn-sm">Edit</button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {meddpicc.map((item) => (
                                    <div
                                        key={item.category}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: 12,
                                            padding: "12px 0",
                                            borderBottom: "1px solid var(--border)",
                                        }}
                                    >
                                        <div style={{ width: 140, flexShrink: 0 }}>
                                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                                {item.category.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <span className={`badge ${statusColors[item.status]}`}>
                                                {item.status.replace(/_/g, " ")}
                                            </span>
                                            {item.notes && (
                                                <p className="text-secondary" style={{ marginTop: 6, fontSize: "0.875rem" }}>
                                                    {item.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activities */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Activity</h3>
                                <button className="btn btn-ghost btn-sm">Log Activity</button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {activities.map((activity, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            gap: 12,
                                            padding: "12px 0",
                                            borderBottom: i < activities.length - 1 ? "1px solid var(--border)" : "none",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "50%",
                                                background: "var(--bg-tertiary)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {activity.type[0]}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="flex justify-between">
                                                <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                                                    {activity.type}
                                                </span>
                                                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                    {activity.date}
                                                </span>
                                            </div>
                                            <p className="text-secondary" style={{ marginTop: 4, fontSize: "0.875rem" }}>
                                                {activity.summary}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Stakeholders */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3 className="card-title">Stakeholders</h3>
                                <button className="btn btn-ghost btn-sm">Add</button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {stakeholders.map((person) => (
                                    <div
                                        key={person.name}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "8px 0",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: "50%",
                                                background: "var(--primary)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            {person.name.split(" ").map((n) => n[0]).join("")}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{person.name}</div>
                                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>{person.title}</div>
                                        </div>
                                        <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
                                            {person.role.replace(/_/g, " ")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3 className="card-title">Account</h3>
                            </div>
                            <div>
                                <Link href={`/accounts/${deal.account.id}`} style={{ color: "var(--primary-light)", fontWeight: 500 }}>
                                    {deal.account.name}
                                </Link>
                                <div className="text-muted" style={{ fontSize: "0.875rem", marginTop: 4 }}>
                                    {deal.account.domain}
                                </div>
                                <span className="badge badge-neutral mt-2">{deal.account.segment}</span>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Products</h3>
                            </div>
                            <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                                {deal.productMix.map((product) => (
                                    <span key={product} className="badge badge-info">
                                        {product}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
