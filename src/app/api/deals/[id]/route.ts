import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-utils";
import { DealStage, ForecastCategory, EnforcementReasonCode } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/deals/[id] - Get deal with full details
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const deal = await prisma.deal.findUnique({
            where: { id },
            include: {
                account: true,
                owner: { select: { id: true, fullName: true, email: true } },
                se: { select: { id: true, fullName: true } },
                stakeholders: {
                    include: {
                        contact: { select: { id: true, name: true, title: true, persona: true } },
                    },
                },
                meddpicc: true,
                pov: true,
                giveGet: {
                    include: {
                        concessions: true,
                        gets: true,
                    },
                },
                procurement: true,
                driScores: {
                    orderBy: { computedAt: "desc" },
                    take: 1,
                },
                activities: {
                    orderBy: { occurredAt: "desc" },
                    take: 10,
                },
                enforcementEvents: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                },
            },
        });

        if (!deal) {
            return error("Deal not found", 404);
        }

        // Serialize BigInt
        return success({
            ...deal,
            amountMicros: deal.amountMicros?.toString(),
        });
    } catch (e) {
        console.error("GET /api/deals/[id] error:", e);
        return error("Failed to fetch deal", 500);
    }
}

// PATCH /api/deals/[id] - Update deal
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await req.json();

        const {
            name,
            stage,
            forecast,
            amountMicros,
            currency,
            termMonths,
            closeDate,
            productMix,
            enforcementState,
            frozenReasonCode,
        } = body;

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (stage !== undefined) updateData.stage = stage as DealStage;
        if (forecast !== undefined) updateData.forecast = forecast as ForecastCategory;
        if (amountMicros !== undefined) updateData.amountMicros = amountMicros ? BigInt(amountMicros) : null;
        if (currency !== undefined) updateData.currency = currency;
        if (termMonths !== undefined) updateData.termMonths = termMonths;
        if (closeDate !== undefined) updateData.closeDate = closeDate ? new Date(closeDate) : null;
        if (productMix !== undefined) updateData.productMix = productMix;
        if (enforcementState !== undefined) updateData.enforcementState = enforcementState;
        if (frozenReasonCode !== undefined) updateData.frozenReasonCode = frozenReasonCode as EnforcementReasonCode | null;

        const deal = await prisma.deal.update({
            where: { id },
            data: updateData,
            include: {
                account: { select: { id: true, name: true } },
                owner: { select: { id: true, fullName: true } },
            },
        });

        return success({
            ...deal,
            amountMicros: deal.amountMicros?.toString(),
        });
    } catch (e) {
        console.error("PATCH /api/deals/[id] error:", e);
        return error("Failed to update deal", 500);
    }
}
