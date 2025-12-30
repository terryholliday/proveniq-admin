import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, getPagination, requireOrgId } from "@/lib/api-utils";
import { DealStage, ForecastCategory } from "@prisma/client";

// GET /api/deals - List deals (org-scoped) with filters
export async function GET(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const url = new URL(req.url);
        const { skip, take, page, limit } = getPagination(req);

        // Filters
        const stage = url.searchParams.get("stage") as DealStage | null;
        const forecast = url.searchParams.get("forecast") as ForecastCategory | null;
        const ownerId = url.searchParams.get("ownerId");
        const accountId = url.searchParams.get("accountId");
        const enforcementState = url.searchParams.get("enforcementState");

        const where = {
            orgId,
            ...(stage && { stage }),
            ...(forecast && { forecast }),
            ...(ownerId && { ownerId }),
            ...(accountId && { accountId }),
            ...(enforcementState && { enforcementState }),
        };

        const [deals, total] = await Promise.all([
            prisma.deal.findMany({
                where,
                skip,
                take,
                orderBy: { updatedAt: "desc" },
                include: {
                    account: { select: { id: true, name: true } },
                    owner: { select: { id: true, fullName: true, email: true } },
                    se: { select: { id: true, fullName: true } },
                    pov: { select: { id: true, status: true } },
                    _count: {
                        select: { stakeholders: true, activities: true, meddpicc: true },
                    },
                },
            }),
            prisma.deal.count({ where }),
        ]);

        return success(deals, { total, page, limit });
    } catch (e) {
        console.error("GET /api/deals error:", e);
        return error("Failed to fetch deals", 500);
    }
}

// POST /api/deals - Create deal
export async function POST(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const body = await req.json();
        const { name, accountId, ownerId, seId, amountMicros, currency, termMonths, closeDate, productMix } = body;

        if (!name || !accountId || !ownerId) {
            return error("name, accountId, and ownerId are required");
        }

        // Verify account exists in org
        const account = await prisma.account.findFirst({
            where: { id: accountId, orgId },
        });
        if (!account) {
            return error("Account not found in org");
        }

        // Verify owner exists in org
        const owner = await prisma.user.findFirst({
            where: { id: ownerId, orgId },
        });
        if (!owner) {
            return error("Owner not found in org");
        }

        const deal = await prisma.deal.create({
            data: {
                orgId,
                name,
                accountId,
                ownerId,
                seId,
                amountMicros: amountMicros ? BigInt(amountMicros) : null,
                currency: currency || "USD",
                termMonths,
                closeDate: closeDate ? new Date(closeDate) : null,
                productMix: productMix || [],
            },
            include: {
                account: { select: { id: true, name: true } },
                owner: { select: { id: true, fullName: true } },
            },
        });

        // Serialize BigInt for JSON
        return success({
            ...deal,
            amountMicros: deal.amountMicros?.toString(),
        });
    } catch (e) {
        console.error("POST /api/deals error:", e);
        return error("Failed to create deal", 500);
    }
}
