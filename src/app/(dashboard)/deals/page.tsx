import { Header } from "@/components/Header";
import Link from "next/link";

// Mock deals data
const deals = [
    {
        id: "1",
        name: "Acme Corp Enterprise",
        account: "Acme Corporation",
        stage: "POV",
        forecast: "COMMIT",
        amount: 450000,
        closeDate: "2025-02-15",
        dri: "GREEN",
        owner: "Terry H.",
        meddpiccScore: 85,
    },
    {
        id: "2",
        name: "TechStart Series B",
        account: "TechStart Inc",
        stage: "PROPOSAL",
        forecast: "BEST_CASE",
        amount: 120000,
        closeDate: "2025-01-30",
        dri: "YELLOW",
        owner: "Terry H.",
        meddpiccScore: 62,
    },
    {
        id: "3",
        name: "Global Logistics Platform",
        account: "Global Logistics Ltd",
        stage: "DISCOVERY",
        forecast: "PIPELINE",
        amount: 280000,
        closeDate: "2025-03-20",
        dri: "GREEN",
        owner: "Terry H.",
        meddpiccScore: 45,
    },
    {
        id: "4",
        name: "FinanceHub Pro License",
        account: "FinanceHub",
        stage: "LEGAL",
        forecast: "COMMIT",
        amount: 195000,
        closeDate: "2025-01-20",
        dri: "RED",
        owner: "Terry H.",
        meddpiccScore: 78,
    },
    {
        id: "5",
        name: "Retail Chain Expansion",
        account: "MegaMart",
        stage: "PROCUREMENT",
        forecast: "COMMIT",
        amount: 340000,
        closeDate: "2025-02-01",
        dri: "YELLOW",
        owner: "Terry H.",
        meddpiccScore: 72,
    },
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

const forecastColors: Record<string, string> = {
    PIPELINE: "badge-neutral",
    BEST_CASE: "badge-info",
    COMMIT: "badge-success",
    CLOSED: "badge-success",
    OMIT: "badge-danger",
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export default function DealsPage() {
    const totalPipeline = deals.reduce((sum, d) => sum + d.amount, 0);

    return (
        <>
            <Header
                title="Deals"
                subtitle={`${deals.length} active deals · ${formatCurrency(totalPipeline)} pipeline`}
                actions={
                    <button className="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Deal
                    </button>
                }
            />

            <div className="page-content">
                {/* Filters */}
                <div className="card mb-4" style={{ padding: 16 }}>
                    <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
                        <select className="form-input" style={{ width: "auto", minWidth: 150 }}>
                            <option value="">All Stages</option>
                            <option value="INTAKE">Intake</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="DISCOVERY">Discovery</option>
                            <option value="POV">POV</option>
                            <option value="PROPOSAL">Proposal</option>
                            <option value="LEGAL">Legal</option>
                            <option value="PROCUREMENT">Procurement</option>
                        </select>

                        <select className="form-input" style={{ width: "auto", minWidth: 150 }}>
                            <option value="">All Forecasts</option>
                            <option value="PIPELINE">Pipeline</option>
                            <option value="BEST_CASE">Best Case</option>
                            <option value="COMMIT">Commit</option>
                        </select>

                        <select className="form-input" style={{ width: "auto", minWidth: 150 }}>
                            <option value="">All DRI States</option>
                            <option value="GREEN">Green</option>
                            <option value="YELLOW">Yellow</option>
                            <option value="RED">Red</option>
                            <option value="BLACK">Black</option>
                        </select>

                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search deals..."
                            style={{ width: "auto", minWidth: 200 }}
                        />
                    </div>
                </div>

                {/* Deals Table */}
                <div className="card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Deal</th>
                                    <th>Account</th>
                                    <th>Stage</th>
                                    <th>Forecast</th>
                                    <th>Amount</th>
                                    <th>Close</th>
                                    <th>DRI</th>
                                    <th>MEDDPICC</th>
                                    <th>Owner</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deals.map((deal) => (
                                    <tr key={deal.id}>
                                        <td>
                                            <Link
                                                href={`/deals/${deal.id}`}
                                                style={{ color: "var(--primary-light)", fontWeight: 500 }}
                                            >
                                                {deal.name}
                                            </Link>
                                        </td>
                                        <td className="text-secondary">{deal.account}</td>
                                        <td>
                                            <span className={`badge ${stageColors[deal.stage] || "badge-neutral"}`}>
                                                {deal.stage}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${forecastColors[deal.forecast] || "badge-neutral"}`}>
                                                {deal.forecast.replace(/_/g, " ")}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, fontFamily: "monospace" }}>
                                            {formatCurrency(deal.amount)}
                                        </td>
                                        <td className="text-secondary">{formatDate(deal.closeDate)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className={`dri-indicator dri-${deal.dri.toLowerCase()}`} />
                                                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                                                    {deal.dri}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                style={{
                                                    width: 40,
                                                    height: 6,
                                                    background: "var(--bg-tertiary)",
                                                    borderRadius: 3,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${deal.meddpiccScore}%`,
                                                        height: "100%",
                                                        background:
                                                            deal.meddpiccScore >= 70
                                                                ? "var(--success)"
                                                                : deal.meddpiccScore >= 50
                                                                    ? "var(--warning)"
                                                                    : "var(--danger)",
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="text-secondary">{deal.owner}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
