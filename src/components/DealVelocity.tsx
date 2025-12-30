"use client";

import { useState } from "react";

interface DealVelocityProps {
    deals: Array<{
        id: string;
        name: string;
        stage: string;
        createdAt: string;
        stageHistory?: Array<{ stage: string; enteredAt: string; exitedAt?: string }>;
    }>;
}

const STAGES = [
    { id: "INTAKE", label: "Intake", avgDays: 3 },
    { id: "QUALIFIED", label: "Qualified", avgDays: 5 },
    { id: "DISCOVERY", label: "Discovery", avgDays: 10 },
    { id: "SOLUTION_FIT", label: "Solution Fit", avgDays: 7 },
    { id: "POV", label: "POV", avgDays: 14 },
    { id: "PROPOSAL", label: "Proposal", avgDays: 7 },
    { id: "NEGOTIATION", label: "Negotiation", avgDays: 10 },
    { id: "COMMIT", label: "Commit", avgDays: 5 },
];

// Mock velocity data
const MOCK_VELOCITY = {
    avgCycleTime: 62,
    avgCycleTimeLastQ: 71,
    byStage: [
        { stage: "INTAKE", avgDays: 2.5, benchmark: 3, deals: 12 },
        { stage: "QUALIFIED", avgDays: 4.2, benchmark: 5, deals: 10 },
        { stage: "DISCOVERY", avgDays: 12.1, benchmark: 10, deals: 8 },
        { stage: "SOLUTION_FIT", avgDays: 6.8, benchmark: 7, deals: 7 },
        { stage: "POV", avgDays: 16.2, benchmark: 14, deals: 5 },
        { stage: "PROPOSAL", avgDays: 8.5, benchmark: 7, deals: 6 },
        { stage: "NEGOTIATION", avgDays: 9.1, benchmark: 10, deals: 4 },
        { stage: "COMMIT", avgDays: 3.8, benchmark: 5, deals: 3 },
    ],
    trends: [
        { month: "Jul", cycleTime: 75 },
        { month: "Aug", cycleTime: 72 },
        { month: "Sep", cycleTime: 68 },
        { month: "Oct", cycleTime: 71 },
        { month: "Nov", cycleTime: 65 },
        { month: "Dec", cycleTime: 62 },
    ],
    topPerformers: [
        { name: "Terry H.", avgCycle: 48, deals: 8 },
        { name: "Sarah M.", avgCycle: 55, deals: 6 },
        { name: "John D.", avgCycle: 61, deals: 5 },
    ],
    slowDeals: [
        { id: "1", name: "Acme Enterprise", daysInStage: 28, stage: "POV", benchmark: 14 },
        { id: "2", name: "GlobalBank Migration", daysInStage: 21, stage: "NEGOTIATION", benchmark: 10 },
        { id: "3", name: "RetailMax Expansion", daysInStage: 18, stage: "DISCOVERY", benchmark: 10 },
    ],
};

export function DealVelocity() {
    const [timeRange, setTimeRange] = useState<"30d" | "90d" | "ytd">("90d");
    const velocity = MOCK_VELOCITY;

    const cycleTimeChange = ((velocity.avgCycleTimeLastQ - velocity.avgCycleTime) / velocity.avgCycleTimeLastQ) * 100;
    const maxDays = Math.max(...velocity.byStage.map(s => Math.max(s.avgDays, s.benchmark)));

    return (
        <div className="deal-velocity">
            <style jsx>{`
                .deal-velocity {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .velocity-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .velocity-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                }

                .time-selector {
                    display: flex;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                    padding: 4px;
                }

                .time-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .time-btn:hover {
                    color: var(--text-primary);
                }

                .time-btn.active {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                }

                .velocity-body {
                    padding: 20px;
                }

                .velocity-kpis {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .velocity-kpi {
                    background: var(--bg-tertiary);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                }

                .kpi-value {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                }

                .kpi-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .kpi-change {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 8px;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                .kpi-change.positive {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                }

                .kpi-change.negative {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .velocity-section {
                    margin-bottom: 24px;
                }

                .section-title {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 16px;
                }

                /* Stage Velocity Chart */
                .stage-chart {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .stage-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stage-label {
                    width: 100px;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    text-align: right;
                }

                .stage-bar-container {
                    flex: 1;
                    height: 24px;
                    background: var(--bg-tertiary);
                    border-radius: 4px;
                    position: relative;
                    overflow: visible;
                }

                .stage-bar {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .stage-bar.fast {
                    background: linear-gradient(90deg, #10b981 0%, #22c55e 100%);
                }

                .stage-bar.normal {
                    background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
                }

                .stage-bar.slow {
                    background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
                }

                .benchmark-line {
                    position: absolute;
                    top: -4px;
                    bottom: -4px;
                    width: 2px;
                    background: var(--text-muted);
                }

                .benchmark-line::after {
                    content: attr(data-label);
                    position: absolute;
                    top: -18px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.6rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                }

                .stage-value {
                    width: 60px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-align: right;
                }

                .stage-value.fast { color: #10b981; }
                .stage-value.normal { color: #f59e0b; }
                .stage-value.slow { color: #ef4444; }

                /* Trend Chart */
                .trend-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                    height: 100px;
                    padding: 0 8px;
                }

                .trend-bar {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }

                .trend-bar-fill {
                    width: 100%;
                    border-radius: 4px 4px 0 0;
                    background: linear-gradient(180deg, var(--primary) 0%, #8b5cf6 100%);
                    transition: height 0.3s ease;
                }

                .trend-label {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                }

                .trend-value {
                    font-size: 0.7rem;
                    font-weight: 600;
                }

                /* Slow Deals */
                .slow-deals {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .slow-deal {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 8px;
                }

                .slow-deal-info {
                    flex: 1;
                }

                .slow-deal-name {
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .slow-deal-stage {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .slow-deal-days {
                    text-align: right;
                }

                .slow-deal-count {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #ef4444;
                }

                .slow-deal-label {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                }

                /* Top Performers */
                .performers {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .performer-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                }

                .performer-rank {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.75rem;
                }

                .performer-rank.gold { background: #fbbf24; color: #1f2937; }
                .performer-rank.silver { background: #9ca3af; color: #1f2937; }
                .performer-rank.bronze { background: #d97706; color: white; }

                .performer-name {
                    flex: 1;
                    font-weight: 500;
                }

                .performer-stats {
                    display: flex;
                    gap: 16px;
                    font-size: 0.8rem;
                }

                .performer-stat {
                    text-align: right;
                }

                .performer-stat-value {
                    font-weight: 600;
                }

                .performer-stat-label {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                }

                .velocity-footer {
                    padding: 12px 20px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .velocity-cta {
                    color: var(--primary-light);
                    cursor: pointer;
                }

                .velocity-cta:hover {
                    text-decoration: underline;
                }
            `}</style>

            <div className="velocity-header">
                <h3 className="velocity-title">⚡ Deal Velocity</h3>
                <div className="time-selector">
                    <button
                        className={`time-btn ${timeRange === "30d" ? "active" : ""}`}
                        onClick={() => setTimeRange("30d")}
                    >
                        30 Days
                    </button>
                    <button
                        className={`time-btn ${timeRange === "90d" ? "active" : ""}`}
                        onClick={() => setTimeRange("90d")}
                    >
                        90 Days
                    </button>
                    <button
                        className={`time-btn ${timeRange === "ytd" ? "active" : ""}`}
                        onClick={() => setTimeRange("ytd")}
                    >
                        YTD
                    </button>
                </div>
            </div>

            <div className="velocity-body">
                {/* KPIs */}
                <div className="velocity-kpis">
                    <div className="velocity-kpi">
                        <div className="kpi-value">{velocity.avgCycleTime}</div>
                        <div className="kpi-label">Avg Cycle (Days)</div>
                        <div className={`kpi-change ${cycleTimeChange > 0 ? "positive" : "negative"}`}>
                            {cycleTimeChange > 0 ? "↓" : "↑"} {Math.abs(cycleTimeChange).toFixed(0)}% vs last Q
                        </div>
                    </div>
                    <div className="velocity-kpi">
                        <div className="kpi-value" style={{ color: "#10b981" }}>{velocity.topPerformers[0].avgCycle}</div>
                        <div className="kpi-label">Best Rep Avg</div>
                        <div className="kpi-change positive">
                            {velocity.avgCycleTime - velocity.topPerformers[0].avgCycle}d faster
                        </div>
                    </div>
                    <div className="velocity-kpi">
                        <div className="kpi-value" style={{ color: "#ef4444" }}>{velocity.slowDeals.length}</div>
                        <div className="kpi-label">Stalled Deals</div>
                        <div className="kpi-change negative">
                            Above benchmark
                        </div>
                    </div>
                </div>

                {/* Stage Velocity */}
                <div className="velocity-section">
                    <div className="section-title">Time in Stage (Days)</div>
                    <div className="stage-chart">
                        {velocity.byStage.map((stage) => {
                            const pct = (stage.avgDays / maxDays) * 100;
                            const benchmarkPct = (stage.benchmark / maxDays) * 100;
                            const status = stage.avgDays <= stage.benchmark * 0.9 ? "fast" 
                                : stage.avgDays <= stage.benchmark * 1.1 ? "normal" : "slow";
                            const stageInfo = STAGES.find(s => s.id === stage.stage);

                            return (
                                <div key={stage.stage} className="stage-row">
                                    <div className="stage-label">{stageInfo?.label || stage.stage}</div>
                                    <div className="stage-bar-container">
                                        <div
                                            className={`stage-bar ${status}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                        <div
                                            className="benchmark-line"
                                            style={{ left: `${benchmarkPct}%` }}
                                            data-label={`${stage.benchmark}d`}
                                        />
                                    </div>
                                    <div className={`stage-value ${status}`}>
                                        {stage.avgDays.toFixed(1)}d
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Trend */}
                <div className="velocity-section">
                    <div className="section-title">Cycle Time Trend</div>
                    <div className="trend-chart">
                        {velocity.trends.map((t, idx) => {
                            const maxCycle = Math.max(...velocity.trends.map(x => x.cycleTime));
                            const heightPct = (t.cycleTime / maxCycle) * 100;
                            return (
                                <div key={idx} className="trend-bar">
                                    <div className="trend-value">{t.cycleTime}</div>
                                    <div
                                        className="trend-bar-fill"
                                        style={{ height: `${heightPct}%` }}
                                    />
                                    <div className="trend-label">{t.month}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stalled Deals */}
                <div className="velocity-section">
                    <div className="section-title">⚠️ Stalled Deals</div>
                    <div className="slow-deals">
                        {velocity.slowDeals.map((deal) => {
                            const stageInfo = STAGES.find(s => s.id === deal.stage);
                            return (
                                <div key={deal.id} className="slow-deal">
                                    <div className="slow-deal-info">
                                        <div className="slow-deal-name">{deal.name}</div>
                                        <div className="slow-deal-stage">
                                            {stageInfo?.label} (benchmark: {deal.benchmark}d)
                                        </div>
                                    </div>
                                    <div className="slow-deal-days">
                                        <div className="slow-deal-count">{deal.daysInStage}d</div>
                                        <div className="slow-deal-label">in stage</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="velocity-section">
                    <div className="section-title">🏆 Fastest Closers</div>
                    <div className="performers">
                        {velocity.topPerformers.map((rep, idx) => (
                            <div key={rep.name} className="performer-row">
                                <div className={`performer-rank ${idx === 0 ? "gold" : idx === 1 ? "silver" : "bronze"}`}>
                                    {idx + 1}
                                </div>
                                <div className="performer-name">{rep.name}</div>
                                <div className="performer-stats">
                                    <div className="performer-stat">
                                        <div className="performer-stat-value">{rep.avgCycle}d</div>
                                        <div className="performer-stat-label">Avg Cycle</div>
                                    </div>
                                    <div className="performer-stat">
                                        <div className="performer-stat-value">{rep.deals}</div>
                                        <div className="performer-stat-label">Deals</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="velocity-footer">
                <span>Updated in real-time</span>
                <span className="velocity-cta">View full report →</span>
            </div>
        </div>
    );
}
