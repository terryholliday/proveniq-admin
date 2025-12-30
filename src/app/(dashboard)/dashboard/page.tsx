import { Header } from "@/components/Header";

// Mock data for dashboard stats
const stats = [
    { label: "Total Pipeline", value: "$2.4M", change: "+12%", positive: true },
    { label: "Active Deals", value: "24", change: "+3", positive: true },
    { label: "Commit Forecast", value: "$890K", change: "-5%", positive: false },
    { label: "Win Rate", value: "34%", change: "+2%", positive: true },
];

const recentDeals = [
    { name: "Acme Corp Enterprise", stage: "POV", amount: "$450,000", dri: "GREEN", owner: "Terry H." },
    { name: "TechStart Series B", stage: "PROPOSAL", amount: "$120,000", dri: "YELLOW", owner: "Terry H." },
    { name: "Global Logistics", stage: "DISCOVERY", amount: "$280,000", dri: "GREEN", owner: "Terry H." },
    { name: "FinanceHub Pro", stage: "LEGAL", amount: "$195,000", dri: "RED", owner: "Terry H." },
];

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

export default function DashboardPage() {
    return (
        <>
            <Header
                title="Dashboard"
                subtitle="Pipeline overview and key metrics"
            />

            <div className="page-content">
                {/* Stats Grid */}
                <div className="stats-grid mb-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="stat-card">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                            <div className={`stat-change ${stat.positive ? "positive" : "negative"}`}>
                                {stat.positive ? "↑" : "↓"} {stat.change} vs last month
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Deals */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Deals</h3>
                        <a href="/deals" className="btn btn-ghost btn-sm">
                            View all →
                        </a>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Deal</th>
                                    <th>Stage</th>
                                    <th>Amount</th>
                                    <th>DRI</th>
                                    <th>Owner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDeals.map((deal) => (
                                    <tr key={deal.name}>
                                        <td>
                                            <a href="#" style={{ color: "var(--primary-light)", fontWeight: 500 }}>
                                                {deal.name}
                                            </a>
                                        </td>
                                        <td>
                                            <span className={`badge ${stageColors[deal.stage] || "badge-neutral"}`}>
                                                {deal.stage}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{deal.amount}</td>
                                        <td>
                                            <div className={`dri-indicator dri-${deal.dri.toLowerCase()}`} />
                                        </td>
                                        <td className="text-secondary">{deal.owner}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pipeline by Stage */}
                <div className="card mt-6">
                    <div className="card-header">
                        <h3 className="card-title">Pipeline by Stage</h3>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {Object.entries(stageColors).slice(0, 10).map(([stage, colorClass]) => (
                            <div
                                key={stage}
                                style={{
                                    padding: "12px 16px",
                                    background: "var(--bg-tertiary)",
                                    borderRadius: "var(--radius-md)",
                                    minWidth: 120,
                                }}
                            >
                                <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                                    {Math.floor(Math.random() * 8)}
                                </div>
                                <div className={colorClass} style={{ fontSize: "0.75rem", marginTop: 4 }}>
                                    {stage.replace(/_/g, " ")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
