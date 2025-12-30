import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, getPagination, requireOrgId } from "@/lib/api-utils";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";

// GET /api/tasks - List tasks (org-scoped) with filters
export async function GET(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const url = new URL(req.url);
        const { skip, take, page, limit } = getPagination(req);

        // Filters
        const status = url.searchParams.get("status") as TaskStatus | null;
        const priority = url.searchParams.get("priority") as TaskPriority | null;
        const type = url.searchParams.get("type") as TaskType | null;
        const assignedToId = url.searchParams.get("assignedToId");
        const dealId = url.searchParams.get("dealId");
        const overdue = url.searchParams.get("overdue") === "true";
        const dueSoon = url.searchParams.get("dueSoon") === "true";

        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        const where: Record<string, unknown> = {
            orgId,
            ...(status && { status }),
            ...(priority && { priority }),
            ...(type && { type }),
            ...(assignedToId && { assignedToId }),
            ...(dealId && { dealId }),
        };

        // Overdue: dueDate < now AND status not DONE/CANCELLED
        if (overdue) {
            where.dueDate = { lt: now };
            where.status = { notIn: ["DONE", "CANCELLED"] };
        }

        // Due soon: dueDate within 3 days AND status not DONE/CANCELLED
        if (dueSoon && !overdue) {
            where.dueDate = { gte: now, lte: threeDaysFromNow };
            where.status = { notIn: ["DONE", "CANCELLED"] };
        }

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take,
                orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
                include: {
                    deal: { select: { id: true, name: true } },
                    account: { select: { id: true, name: true } },
                    contact: { select: { id: true, name: true } },
                    assignedTo: { select: { id: true, fullName: true, email: true } },
                    createdBy: { select: { id: true, fullName: true } },
                },
            }),
            prisma.task.count({ where }),
        ]);

        return success(tasks, { total, page, limit });
    } catch (e) {
        console.error("GET /api/tasks error:", e);
        return error("Failed to fetch tasks", 500);
    }
}

// POST /api/tasks - Create task
export async function POST(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const body = await req.json();
        const {
            title,
            description,
            type,
            priority,
            dueDate,
            dealId,
            accountId,
            contactId,
            assignedToId,
            createdById,
        } = body;

        if (!title) {
            return error("title is required");
        }

        const task = await prisma.task.create({
            data: {
                orgId,
                title,
                description,
                type: (type as TaskType) || "OTHER",
                priority: (priority as TaskPriority) || "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : null,
                dealId,
                accountId,
                contactId,
                assignedToId,
                createdById,
            },
            include: {
                deal: { select: { id: true, name: true } },
                account: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, fullName: true } },
            },
        });

        return success(task);
    } catch (e) {
        console.error("POST /api/tasks error:", e);
        return error("Failed to create task", 500);
    }
}
