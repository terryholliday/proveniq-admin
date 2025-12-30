import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-utils";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/tasks/[id] - Get task details
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                deal: { select: { id: true, name: true, stage: true } },
                account: { select: { id: true, name: true } },
                contact: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, fullName: true, email: true } },
                createdBy: { select: { id: true, fullName: true } },
                closePlanItem: { select: { id: true, title: true } },
            },
        });

        if (!task) {
            return error("Task not found", 404);
        }

        return success(task);
    } catch (e) {
        console.error("GET /api/tasks/[id] error:", e);
        return error("Failed to fetch task", 500);
    }
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await req.json();

        const {
            title,
            description,
            type,
            status,
            priority,
            dueDate,
            completedAt,
            assignedToId,
            dealId,
            accountId,
            contactId,
        } = body;

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type as TaskType;
        if (status !== undefined) updateData.status = status as TaskStatus;
        if (priority !== undefined) updateData.priority = priority as TaskPriority;
        if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
        if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
        if (dealId !== undefined) updateData.dealId = dealId;
        if (accountId !== undefined) updateData.accountId = accountId;
        if (contactId !== undefined) updateData.contactId = contactId;

        // Auto-set completedAt when marking as DONE
        if (status === "DONE" && completedAt === undefined) {
            updateData.completedAt = new Date();
        } else if (completedAt !== undefined) {
            updateData.completedAt = completedAt ? new Date(completedAt) : null;
        }

        const task = await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                deal: { select: { id: true, name: true } },
                account: { select: { id: true, name: true } },
                assignedTo: { select: { id: true, fullName: true } },
            },
        });

        return success(task);
    } catch (e) {
        console.error("PATCH /api/tasks/[id] error:", e);
        return error("Failed to update task", 500);
    }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await prisma.task.delete({
            where: { id },
        });

        return success({ deleted: true });
    } catch (e) {
        console.error("DELETE /api/tasks/[id] error:", e);
        return error("Failed to delete task", 500);
    }
}
