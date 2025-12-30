import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, requireOrgId } from "@/lib/api-utils";
import { ClosePlanItemStatus } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/deals/[id]/close-plan - Get or generate close plan for deal
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: dealId } = await params;

        // First try to find existing close plan
        let closePlan = await prisma.dealClosePlan.findUnique({
            where: { dealId },
            include: {
                items: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        owner: { select: { id: true, fullName: true } },
                        tasks: { select: { id: true, title: true, status: true } },
                    },
                },
                deal: {
                    select: {
                        id: true,
                        name: true,
                        stage: true,
                        closeDate: true,
                        amountMicros: true,
                    },
                },
            },
        });

        if (!closePlan) {
            return success(null);
        }

        // Serialize BigInt
        return success({
            ...closePlan,
            deal: closePlan.deal
                ? {
                      ...closePlan.deal,
                      amountMicros: closePlan.deal.amountMicros?.toString(),
                  }
                : null,
        });
    } catch (e) {
        console.error("GET /api/deals/[id]/close-plan error:", e);
        return error("Failed to fetch close plan", 500);
    }
}

// POST /api/deals/[id]/close-plan - Generate close plan for deal
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const { id: dealId } = await params;
        const body = await req.json();
        const { targetCloseDate, items } = body;

        // Get deal info for context
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                account: { select: { name: true } },
                stakeholders: {
                    include: { contact: { select: { name: true, persona: true } } },
                },
                meddpicc: true,
            },
        });

        if (!deal) {
            return error("Deal not found", 404);
        }

        // Generate default close plan items based on deal stage and MEDDPICC gaps
        const defaultItems = items || generateDefaultClosePlanItems(deal);

        // Upsert close plan
        const closePlan = await prisma.dealClosePlan.upsert({
            where: { dealId },
            update: {
                targetCloseDate: targetCloseDate ? new Date(targetCloseDate) : deal.closeDate,
                updatedAt: new Date(),
            },
            create: {
                orgId,
                dealId,
                targetCloseDate: targetCloseDate ? new Date(targetCloseDate) : deal.closeDate,
            },
        });

        // Create items if provided
        if (defaultItems && defaultItems.length > 0) {
            // Delete existing items and recreate
            await prisma.closePlanItem.deleteMany({
                where: { closePlanId: closePlan.id },
            });

            await prisma.closePlanItem.createMany({
                data: defaultItems.map(
                    (
                        item: {
                            title: string;
                            description?: string;
                            category?: string;
                            dueDate?: string;
                            ownerId?: string;
                        },
                        index: number
                    ) => ({
                        orgId,
                        closePlanId: closePlan.id,
                        title: item.title,
                        description: item.description,
                        category: item.category,
                        sortOrder: index,
                        dueDate: item.dueDate ? new Date(item.dueDate) : null,
                        ownerId: item.ownerId,
                    })
                ),
            });
        }

        // Fetch complete close plan with items
        const completeClosePlan = await prisma.dealClosePlan.findUnique({
            where: { id: closePlan.id },
            include: {
                items: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        owner: { select: { id: true, fullName: true } },
                    },
                },
            },
        });

        return success(completeClosePlan);
    } catch (e) {
        console.error("POST /api/deals/[id]/close-plan error:", e);
        return error("Failed to generate close plan", 500);
    }
}

// PATCH /api/deals/[id]/close-plan - Update close plan item status
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: dealId } = await params;
        const body = await req.json();
        const { itemId, status, completedAt } = body;

        if (!itemId || !status) {
            return error("itemId and status are required");
        }

        const updateData: Record<string, unknown> = {
            status: status as ClosePlanItemStatus,
        };

        if (status === "COMPLETE") {
            updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
        }

        const item = await prisma.closePlanItem.update({
            where: { id: itemId },
            data: updateData,
            include: {
                owner: { select: { id: true, fullName: true } },
            },
        });

        return success(item);
    } catch (e) {
        console.error("PATCH /api/deals/[id]/close-plan error:", e);
        return error("Failed to update close plan item", 500);
    }
}

// Helper function to generate default close plan items based on deal context
function generateDefaultClosePlanItems(deal: {
    stage: string;
    meddpicc: Array<{ category: string; status: string }>;
    stakeholders: Array<{ roleInDeal: string }>;
}): Array<{ title: string; description?: string; category: string }> {
    const items: Array<{ title: string; description?: string; category: string }> = [];

    // Check MEDDPICC gaps
    const meddpiccMap = new Map(deal.meddpicc.map((m) => [m.category, m.status]));

    if (meddpiccMap.get("ECONOMIC_BUYER") !== "BUYER_CONFIRMED") {
        items.push({
            title: "Confirm Economic Buyer access",
            description: "Schedule meeting with economic buyer to validate decision authority",
            category: "stakeholder",
        });
    }

    if (meddpiccMap.get("CHAMPION") !== "BUYER_CONFIRMED") {
        items.push({
            title: "Strengthen Champion relationship",
            description: "Ensure champion is actively selling internally",
            category: "champion",
        });
    }

    if (meddpiccMap.get("DECISION_CRITERIA") !== "BUYER_CONFIRMED") {
        items.push({
            title: "Document decision criteria",
            description: "Get buyer confirmation on evaluation criteria",
            category: "technical",
        });
    }

    if (meddpiccMap.get("PAPER_PROCESS") !== "BUYER_CONFIRMED") {
        items.push({
            title: "Map paper process",
            description: "Document procurement, legal, and signature requirements",
            category: "legal",
        });
    }

    if (meddpiccMap.get("METRICS") !== "BUYER_CONFIRMED") {
        items.push({
            title: "Quantify business impact",
            description: "Document specific metrics and ROI case",
            category: "commercial",
        });
    }

    // Add stage-specific items
    const stage = deal.stage;
    if (["PROPOSAL", "LEGAL", "PROCUREMENT"].includes(stage)) {
        items.push({
            title: "Prepare final proposal",
            description: "Finalize pricing and terms document",
            category: "commercial",
        });
    }

    if (["LEGAL", "PROCUREMENT", "COMMIT"].includes(stage)) {
        items.push({
            title: "Complete security review",
            description: "Ensure all security questionnaires are submitted",
            category: "technical",
        });
        items.push({
            title: "Obtain legal approval",
            description: "Get contract through legal review",
            category: "legal",
        });
    }

    // Check for missing stakeholder roles
    const roles = new Set(deal.stakeholders.map((s) => s.roleInDeal));
    if (!roles.has("ECONOMIC_BUYER")) {
        items.push({
            title: "Identify economic buyer",
            description: "Map org chart to find budget holder",
            category: "stakeholder",
        });
    }

    return items;
}
