import { Header } from "@/components/Header";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

const stageColors: Record<string, string> = {
    INTAKE: "stage-intake",
    QUALIFIED: "stage-qualified",
    DISCOVERY: "stage-discovery",
    SOLUTION_FIT: "stage-solution-fit",
    POV: "stage-pov",
    PROPOSAL: "stage-proposal",
    LEGAL: "stage-legal",
    PROCUREMENT: "stage-procurement",
    COMMIT: "stage-commit",
    CLOSED_WON: "stage-closed-won",
    CLOSED_LOST: "stage-closed-lost",
};

const forecastColors: Record<string, string> = {
    PIPELINE: "badge-neutral",
    BEST_CASE: "badge-info",
    COMMIT: "badge-success",
    CLOSED: "badge-success",
    OMIT: "badge-danger",
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

function formatDate(date: Date | string | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: PageProps) {
    const { id } = await params;

    const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
            account: true,
            owner: true,
            se: true,
            stakeholders: {
                include: { contact: true },
            },
            meddpicc: {
                orderBy: { category: "asc" },
            },
            driScores: {
                take: 1,
            },
            activities: {
                take: 10,
            },
        },
    });

    if (!deal) {
        notFound();
    }

    const amount = deal.amountMicros ? Number(deal.amountMicros) / 1_000_000 : 0;
    const latestDri = deal.driScores[0];
    const driState = latestDri?.state?.toLowerCase() || "black";
    const driScore = latestDri?.total || 0;

    return (
        <>
            <Header
                title={deal.name}
                subtitle={`${deal.account.name} · ${formatCurrency(amount)}`}
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
                                <span className={`badge ${forecastColors[deal.forecast] || "badge-neutral"}`}>
                                    {deal.forecast}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Amount</span>
                            <div style={{ fontWeight: 700, fontSize: "1.125rem", marginTop: 2 }}>
                                {formatCurrency(amount)}
                            </div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Term</span>
                            <div style={{ fontWeight: 500, marginTop: 4 }}>{deal.termMonths || 12} months</div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>Close Date</span>
                            <div style={{ fontWeight: 500, marginTop: 4 }}>{formatDate(deal.closeDate)}</div>
                        </div>
                        <div>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>DRI</span>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`dri-indicator dri-${driState}`} />
                                <span style={{ fontWeight: 600 }}>{driScore}</span>
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
                                {deal.meddpicc.length === 0 ? (
                                    <p className="text-muted">No evidence recorded yet</p>
                                ) : (
                                    deal.meddpicc.map((item) => (
                                        <div
                                            key={item.id}
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
                                                <span className={`badge ${statusColors[item.status] || "badge-neutral"}`}>
                                                    {item.status.replace(/_/g, " ")}
                                                </span>
                                                {item.notes && (
                                                    <p className="text-secondary" style={{ marginTop: 6, fontSize: "0.875rem" }}>
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Activities */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Recent Activity</h3>
                                <button className="btn btn-ghost btn-sm">Log Activity</button>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {deal.activities.length === 0 ? (
                                    <p className="text-muted">No activities recorded</p>
                                ) : (
                                    deal.activities.map((activity, i) => (
                                        <div
                                            key={activity.id}
                                            style={{
                                                display: "flex",
                                                gap: 12,
                                                padding: "12px 0",
                                                borderBottom: i < deal.activities.length - 1 ? "1px solid var(--border)" : "none",
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
                                                        {formatDate(activity.occurredAt)}
                                                    </span>
                                                </div>
                                                <p className="text-secondary" style={{ marginTop: 4, fontSize: "0.875rem" }}>
                                                    {activity.summary || "No summary"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                {deal.stakeholders.length === 0 ? (
                                    <p className="text-muted">No stakeholders mapped</p>
                                ) : (
                                    deal.stakeholders.map((s) => (
                                        <div
                                            key={s.id}
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
                                                {s.contact.name.split(" ").map((n) => n[0]).join("")}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{s.contact.name}</div>
                                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{s.contact.title || "-"}</div>
                                            </div>
                                            <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
                                                {s.roleInDeal.replace(/_/g, " ")}
                                            </span>
                                        </div>
                                    ))
                                )}
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
                                    {deal.account.domain || "No domain"}
                                </div>
                                <span className="badge badge-neutral mt-2">{deal.account.segment}</span>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="card mb-4">
                            <div className="card-header">
                                <h3 className="card-title">Products</h3>
                            </div>
                            <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                                {(deal.productMix || []).map((product) => (
                                    <span key={product} className="badge badge-info">
                                        {product}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Owner & SE */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Team</h3>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <div>
                                    <span className="text-muted" style={{ fontSize: "0.75rem" }}>Owner</span>
                                    <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{deal.owner?.fullName || "-"}</div>
                                </div>
                                {deal.se && (
                                    <div>
                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>SE</span>
                                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{deal.se.fullName}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
