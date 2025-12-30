import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, requireOrgId } from "@/lib/api-utils";
import {
    EnforcementEventType,
    EnforcementAction,
    EnforcementReasonCode,
} from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/deals/[id]/enforcement - Get enforcement events for a deal
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id: dealId } = await params;

        const events = await prisma.enforcementEvent.findMany({
            where: { dealId },
            include: {
                user: { select: { id: true, fullName: true, email: true } },
                override: true,
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return success(events);
    } catch (e) {
        console.error("GET /api/deals/[id]/enforcement error:", e);
        return error("Failed to fetch enforcement events", 500);
    }
}

// POST /api/deals/[id]/enforcement - Log enforcement event
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const { id: dealId } = await params;
        const body = await req.json();

        const {
            userId,
            eventType,
            action,
            allowed,
            reasonCode,
            evidenceRefs,
            overrideId,
        } = body;

        if (!eventType || !action || allowed === undefined || !reasonCode) {
            return error("eventType, action, allowed, and reasonCode are required");
        }

        const event = await prisma.enforcementEvent.create({
            data: {
                orgId,
                dealId,
                userId,
                eventType: eventType as EnforcementEventType,
                action: action as EnforcementAction,
                allowed,
                reasonCode: reasonCode as EnforcementReasonCode,
                evidenceRefs: evidenceRefs || [],
                overrideId,
            },
            include: {
                user: { select: { id: true, fullName: true } },
                override: true,
            },
        });

        // If action was blocked, update deal enforcement state
        if (
            !allowed &&
            [
                "DRI_RED_REQUIRES_ESCALATION",
                "DRI_BLACK_AUTO_HALT",
                "POLICY_VIOLATION_HARD",
            ].includes(reasonCode)
        ) {
            await prisma.deal.update({
                where: { id: dealId },
                data: {
                    enforcementState: "FROZEN",
                    frozenReasonCode: reasonCode as EnforcementReasonCode,
                },
            });
        }

        return success(event);
    } catch (e) {
        console.error("POST /api/deals/[id]/enforcement error:", e);
        return error("Failed to log enforcement event", 500);
    }
}
