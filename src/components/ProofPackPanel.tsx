"use client";

import { useState } from "react";
import {
    FileText,
    Download,
    Copy,
    Check,
    Sparkles,
    Calendar,
    DollarSign,
    Users,
    Target,
    TrendingUp,
    Clock,
    Loader2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface ProofPack {
    id: string;
    dealId: string;
    generatedAt: string;
    dealName: string;
    accountName: string;
    dealValue?: string;
    stage: string;
    closeDate?: string;
    meddpiccSnapshot?: Array<{ category: string; status: string; notes?: string }>;
    stakeholderSnapshot?: Array<{
        name: string;
        title?: string;
        roleInDeal: string;
        authorityLevel: number;
    }>;
    activitySummary?: { recentCount: number; activities: Array<{ type: string; summary: string }> };
    winProbability?: number;
    driScore?: number;
    driState?: string;
    executiveSummary?: string;
    generatedBy?: { fullName: string };
}

// Demo proof pack data
const DEMO_PROOF_PACK: ProofPack = {
    id: "pp1",
    dealId: "d1",
    generatedAt: new Date().toISOString(),
    dealName: "Acme Corp Enterprise Platform",
    accountName: "Acme Corporation",
    dealValue: "1200000000000",
    stage: "LEGAL",
    closeDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    meddpiccSnapshot: [
        { category: "METRICS", status: "BUYER_CONFIRMED", notes: "$2.4M annual savings identified" },
        { category: "ECONOMIC_BUYER", status: "EVIDENCED", notes: "CFO Sarah Chen has budget authority" },
        { category: "DECISION_CRITERIA", status: "BUYER_CONFIRMED", notes: "Security, integration, ROI" },
        { category: "DECISION_PROCESS", status: "EVIDENCED", notes: "Legal → Procurement → CFO sign-off" },
        { category: "PAPER_PROCESS", status: "CLAIMED", notes: "Standard MSA with 2-week legal review" },
        { category: "CHAMPION", status: "BUYER_CONFIRMED", notes: "VP Ops Mike actively selling internally" },
        { category: "COMPETITION", status: "EVIDENCED", notes: "Incumbent Salesforce, we're preferred" },
    ],
    stakeholderSnapshot: [
        { name: "Sarah Chen", title: "CFO", roleInDeal: "ECONOMIC_BUYER", authorityLevel: 3 },
        { name: "Mike Johnson", title: "VP Operations", roleInDeal: "CHAMPION", authorityLevel: 2 },
        { name: "Lisa Park", title: "Director IT", roleInDeal: "TECH_EVAL", authorityLevel: 2 },
        { name: "David Kim", title: "Legal Counsel", roleInDeal: "LEGAL", authorityLevel: 2 },
    ],
    activitySummary: {
        recentCount: 12,
        activities: [
            { type: "MEETING", summary: "POV results presentation to leadership" },
            { type: "EMAIL", summary: "Sent updated pricing proposal" },
            { type: "CALL", summary: "Champion prep call for board presentation" },
        ],
    },
    winProbability: 78,
    driScore: 82,
    driState: "GREEN",
    executiveSummary: `**Acme Corp Enterprise Platform** is currently in **LEGAL** stage with 14 days to target close.

**Win Probability:** 78%

**Champion:** Mike Johnson (VP Operations)
**Economic Buyer:** Sarah Chen (CFO)

**Validated:** METRICS, DECISION_CRITERIA, CHAMPION

**Gaps to Address:** PAPER_PROCESS

**Key Risks:**
- Legal review timeline may extend if custom terms requested
- CFO travel schedule could delay final signature

**Recommended Actions:**
1. Accelerate legal review by providing all compliance docs upfront
2. Schedule backup signature authority with VP Finance
3. Prepare champion with executive summary for CFO briefing`,
    generatedBy: { fullName: "Alex Johnson" },
};

const STATUS_COLORS: Record<string, string> = {
    BUYER_CONFIRMED: "bg-green-500",
    EVIDENCED: "bg-blue-500",
    CLAIMED: "bg-amber-500",
    MISSING: "bg-slate-600",
};

const DRI_COLORS: Record<string, string> = {
    GREEN: "text-green-400",
    YELLOW: "text-amber-400",
    RED: "text-red-400",
    BLACK: "text-slate-400",
};

function formatCurrency(micros: string | undefined): string {
    if (!micros) return "$0";
    const amount = parseInt(micros) / 1_000_000;
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface ProofPackPanelProps {
    dealId: string;
    dealName?: string;
    demoMode?: boolean;
}

export default function ProofPackPanel({ dealId, dealName, demoMode = true }: ProofPackPanelProps) {
    const [proofPack, setProofPack] = useState<ProofPack | null>(null);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const handleGenerate = async () => {
        setGenerating(true);

        if (demoMode) {
            await new Promise((r) => setTimeout(r, 2000));
            setProofPack(DEMO_PROOF_PACK);
        } else {
            try {
                const { generateProofPack } = await import("@/lib/api-client");
                const result = await generateProofPack(dealId);
                setProofPack(result.data);
            } catch (err) {
                console.error("Failed to generate proof pack:", err);
                setProofPack(DEMO_PROOF_PACK);
            }
        }

        setGenerating(false);
    };

    const handleCopy = async () => {
        if (!proofPack?.executiveSummary) return;

        const fullText = `
PROOF PACK: ${proofPack.dealName}
Account: ${proofPack.accountName}
Value: ${formatCurrency(proofPack.dealValue)}
Stage: ${proofPack.stage}
Close Date: ${proofPack.closeDate ? formatDate(proofPack.closeDate) : "TBD"}
Win Probability: ${proofPack.winProbability}%
DRI Score: ${proofPack.driScore} (${proofPack.driState})

EXECUTIVE SUMMARY:
${proofPack.executiveSummary.replace(/\*\*/g, "")}

MEDDPICC STATUS:
${proofPack.meddpiccSnapshot?.map((m) => `- ${m.category}: ${m.status}${m.notes ? ` - ${m.notes}` : ""}`).join("\n") || "N/A"}

KEY STAKEHOLDERS:
${proofPack.stakeholderSnapshot?.map((s) => `- ${s.name} (${s.title}) - ${s.roleInDeal}`).join("\n") || "N/A"}

Generated: ${formatDate(proofPack.generatedAt)}
        `.trim();

        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!proofPack) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Generate Proof Pack</h3>
                    <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                        Create an executive deal summary with MEDDPICC status, stakeholder map, activity timeline,
                        and AI-generated insights. Perfect for QBRs, forecast calls, and deal reviews.
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg flex items-center gap-2 mx-auto transition-colors"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating proof pack...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Proof Pack
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">Proof Pack</h3>
                        {demoMode && (
                            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                                Demo
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-400" />
                            ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                            )}
                        </button>
                        <button
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Download PDF"
                        >
                            <Download className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {expanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                        <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">
                            {formatCurrency(proofPack.dealValue)}
                        </p>
                        <p className="text-xs text-slate-400">Value</p>
                    </div>
                    <div className="text-center">
                        <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">{proofPack.winProbability}%</p>
                        <p className="text-xs text-slate-400">Win Prob</p>
                    </div>
                    <div className="text-center">
                        <Target
                            className={`w-5 h-5 mx-auto mb-1 ${DRI_COLORS[proofPack.driState || "GREEN"]}`}
                        />
                        <p className="text-lg font-bold text-white">{proofPack.driScore}</p>
                        <p className="text-xs text-slate-400">DRI</p>
                    </div>
                    <div className="text-center">
                        <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-white">
                            {proofPack.closeDate ? formatDate(proofPack.closeDate).split(",")[0] : "TBD"}
                        </p>
                        <p className="text-xs text-slate-400">Close</p>
                    </div>
                </div>
            </div>

            {expanded && (
                <>
                    {/* Executive Summary */}
                    <div className="px-6 py-4 border-b border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Executive Summary</h4>
                        <div className="prose prose-sm prose-invert max-w-none">
                            {proofPack.executiveSummary?.split("\n").map((line, i) => {
                                if (line.startsWith("**") && line.endsWith("**")) {
                                    return (
                                        <p key={i} className="font-semibold text-white">
                                            {line.replace(/\*\*/g, "")}
                                        </p>
                                    );
                                }
                                if (line.startsWith("**")) {
                                    const parts = line.split("**");
                                    return (
                                        <p key={i} className="text-slate-300">
                                            <strong className="text-white">{parts[1]}</strong>
                                            {parts[2]}
                                        </p>
                                    );
                                }
                                if (line.match(/^\d\./)) {
                                    return (
                                        <p key={i} className="text-slate-300 ml-4">
                                            {line}
                                        </p>
                                    );
                                }
                                if (line.startsWith("-")) {
                                    return (
                                        <p key={i} className="text-slate-300 ml-4">
                                            {line}
                                        </p>
                                    );
                                }
                                return line ? (
                                    <p key={i} className="text-slate-300">
                                        {line}
                                    </p>
                                ) : (
                                    <br key={i} />
                                );
                            })}
                        </div>
                    </div>

                    {/* MEDDPICC Grid */}
                    <div className="px-6 py-4 border-b border-slate-700">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">MEDDPICC Status</h4>
                        <div className="grid grid-cols-7 gap-2">
                            {proofPack.meddpiccSnapshot?.map((m) => (
                                <div key={m.category} className="text-center" title={m.notes}>
                                    <div
                                        className={`w-full h-2 rounded-full ${STATUS_COLORS[m.status] || STATUS_COLORS.MISSING}`}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">{m.category.charAt(0)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs">
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-slate-400">Confirmed</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-slate-400">Evidenced</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-slate-400">Claimed</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-slate-600" />
                                <span className="text-slate-400">Missing</span>
                            </span>
                        </div>
                    </div>

                    {/* Stakeholders */}
                    <div className="px-6 py-4">
                        <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Key Stakeholders
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {proofPack.stakeholderSnapshot?.slice(0, 4).map((s, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-slate-700/30 rounded-lg border border-slate-700"
                                >
                                    <p className="text-white font-medium text-sm">{s.name}</p>
                                    <p className="text-slate-400 text-xs">{s.title}</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                                        {s.roleInDeal.replace("_", " ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Generated {formatDate(proofPack.generatedAt)}
                    {proofPack.generatedBy && ` by ${proofPack.generatedBy.fullName}`}
                </div>
                <button
                    onClick={handleGenerate}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Regenerate
                </button>
            </div>
        </div>
    );
}
