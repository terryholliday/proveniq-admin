import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, requireOrgId } from "@/lib/api-utils";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/deals/[id]/proof-pack - List proof packs for deal
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: dealId } = await params;

        const proofPacks = await prisma.proofPack.findMany({
            where: { dealId },
            orderBy: { generatedAt: "desc" },
            include: {
                generatedBy: { select: { id: true, fullName: true } },
            },
        });

        // Serialize BigInt
        const serialized = proofPacks.map((pp) => ({
            ...pp,
            dealValue: pp.dealValue?.toString() || null,
        }));

        return success(serialized);
    } catch (e) {
        console.error("GET /api/deals/[id]/proof-pack error:", e);
        return error("Failed to fetch proof packs", 500);
    }
}

// POST /api/deals/[id]/proof-pack - Generate new proof pack snapshot
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const { id: dealId } = await params;
        const body = await req.json();
        const { generatedById, executiveSummary } = body;

        // Get complete deal data for snapshot
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                account: { select: { name: true } },
                stakeholders: {
                    include: {
                        contact: { select: { name: true, title: true, persona: true } },
                    },
                },
                meddpicc: {
                    include: {
                        lastUpdatedBy: { select: { fullName: true } },
                    },
                },
                activities: {
                    orderBy: { occurredAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        type: true,
                        summary: true,
                        occurredAt: true,
                    },
                },
                driScores: {
                    orderBy: { computedAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!deal) {
            return error("Deal not found", 404);
        }

        // Calculate win probability based on MEDDPICC status
        const meddpiccScores: number[] = deal.meddpicc.map((m) => {
            switch (m.status) {
                case "BUYER_CONFIRMED":
                    return 100;
                case "EVIDENCED":
                    return 75;
                case "CLAIMED":
                    return 40;
                default:
                    return 0;
            }
        });
        const winProbability =
            meddpiccScores.length > 0
                ? Math.round(meddpiccScores.reduce((a: number, b: number) => a + b, 0) / meddpiccScores.length)
                : 0;

        // Get latest DRI score
        const latestDri = deal.driScores[0];

        // Create stakeholder snapshot
        const stakeholderSnapshot = deal.stakeholders.map((s) => ({
            name: s.contact.name,
            title: s.contact.title,
            persona: s.contact.persona,
            roleInDeal: s.roleInDeal,
            authorityLevel: s.authorityLevel,
        }));

        // Create MEDDPICC snapshot
        const meddpiccSnapshot = deal.meddpicc.map((m) => ({
            category: m.category,
            status: m.status,
            notes: m.notes,
            lastUpdatedBy: m.lastUpdatedBy?.fullName,
        }));

        // Create activity summary
        const activitySummary = {
            recentCount: deal.activities.length,
            activities: deal.activities.map((a) => ({
                type: a.type,
                summary: a.summary,
                occurredAt: a.occurredAt,
            })),
        };

        // Generate executive summary if not provided
        const autoSummary =
            executiveSummary ||
            generateExecutiveSummary(deal, winProbability, stakeholderSnapshot, meddpiccSnapshot);

        // Create proof pack
        const proofPack = await prisma.proofPack.create({
            data: {
                orgId,
                dealId,
                generatedById,
                dealName: deal.name,
                accountName: deal.account.name,
                dealValue: deal.amountMicros,
                stage: deal.stage,
                closeDate: deal.closeDate,
                meddpiccSnapshot,
                stakeholderSnapshot,
                activitySummary,
                winProbability,
                driScore: latestDri?.total,
                driState: latestDri?.state,
                executiveSummary: autoSummary,
            },
            include: {
                generatedBy: { select: { id: true, fullName: true } },
            },
        });

        return success({
            ...proofPack,
            dealValue: proofPack.dealValue?.toString() || null,
        });
    } catch (e) {
        console.error("POST /api/deals/[id]/proof-pack error:", e);
        return error("Failed to generate proof pack", 500);
    }
}

// Helper to generate executive summary
function generateExecutiveSummary(
    deal: { name: string; stage: string; closeDate: Date | null },
    winProbability: number,
    stakeholders: Array<{ name: string; roleInDeal: string }>,
    meddpicc: Array<{ category: string; status: string }>
): string {
    const champion = stakeholders.find((s) => s.roleInDeal === "CHAMPION");
    const economicBuyer = stakeholders.find((s) => s.roleInDeal === "ECONOMIC_BUYER");

    const gaps = meddpicc
        .filter((m) => m.status === "MISSING" || m.status === "CLAIMED")
        .map((m) => m.category);

    const strengths = meddpicc.filter((m) => m.status === "BUYER_CONFIRMED").map((m) => m.category);

    let summary = `**${deal.name}** is currently in **${deal.stage}** stage`;

    if (deal.closeDate) {
        const daysToClose = Math.ceil(
            (deal.closeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        summary += ` with ${daysToClose} days to target close`;
    }

    summary += `.\n\n**Win Probability:** ${winProbability}%\n\n`;

    if (champion) {
        summary += `**Champion:** ${champion.name}\n`;
    }
    if (economicBuyer) {
        summary += `**Economic Buyer:** ${economicBuyer.name}\n`;
    }

    if (strengths.length > 0) {
        summary += `\n**Validated:** ${strengths.join(", ")}\n`;
    }

    if (gaps.length > 0) {
        summary += `\n**Gaps to Address:** ${gaps.join(", ")}\n`;
    }

    return summary;
}
