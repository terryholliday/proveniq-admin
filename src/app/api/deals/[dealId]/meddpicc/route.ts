import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, requireOrgId } from "@/lib/api-utils";
import { EvidenceCategory, EvidenceStatus } from "@prisma/client";

interface RouteParams {
    params: Promise<{ dealId: string }>;
}

// GET /api/deals/[dealId]/meddpicc - Get all MEDDPICC evidence for a deal
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;

        const { dealId } = await params;

        const evidence = await prisma.meddpiccEvidence.findMany({
            where: { dealId },
            include: {
                lastUpdatedBy: { select: { id: true, fullName: true } },
            },
            orderBy: { category: "asc" },
        });

        // If no evidence exists, return empty template with all categories
        if (evidence.length === 0) {
            const categories = Object.values(EvidenceCategory);
            return success(
                categories.map((category) => ({
                    category,
                    status: "MISSING",
                    evidenceRefs: [],
                    notes: null,
                }))
            );
        }

        return success(evidence);
    } catch (e) {
        console.error("GET /api/deals/[dealId]/meddpicc error:", e);
        return error("Failed to fetch MEDDPICC evidence", 500);
    }
}

// PUT /api/deals/[dealId]/meddpicc - Upsert MEDDPICC evidence
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const { dealId } = await params;
        const body = await req.json();
        const { category, status, evidenceRefs, notes, updatedById } = body;

        if (!category || !Object.values(EvidenceCategory).includes(category)) {
            return error("Valid category is required");
        }

        const evidence = await prisma.meddpiccEvidence.upsert({
            where: {
                dealId_category: { dealId, category },
            },
            update: {
                status: status as EvidenceStatus,
                evidenceRefs: evidenceRefs || [],
                notes,
                lastUpdatedById: updatedById,
            },
            create: {
                orgId,
                dealId,
                category: category as EvidenceCategory,
                status: status as EvidenceStatus || "MISSING",
                evidenceRefs: evidenceRefs || [],
                notes,
                lastUpdatedById: updatedById,
            },
            include: {
                lastUpdatedBy: { select: { id: true, fullName: true } },
            },
        });

        return success(evidence);
    } catch (e) {
        console.error("PUT /api/deals/[dealId]/meddpicc error:", e);
        return error("Failed to update MEDDPICC evidence", 500);
    }
}
