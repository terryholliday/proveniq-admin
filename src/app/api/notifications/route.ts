import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, getPagination, requireOrgId } from "@/lib/api-utils";
import { NotificationType } from "@prisma/client";

// GET /api/notifications - List notifications for current user
export async function GET(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const url = new URL(req.url);
        const { skip, take, page, limit } = getPagination(req);

        // Get userId from header (set by auth middleware)
        const userId = url.searchParams.get("userId") || req.headers.get("x-user-id");
        if (!userId) {
            return error("userId is required", 400);
        }

        const unreadOnly = url.searchParams.get("unreadOnly") === "true";

        const where = {
            orgId,
            userId,
            ...(unreadOnly && { read: false }),
        };

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    deal: { select: { id: true, name: true } },
                },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { orgId, userId, read: false } }),
        ]);

        return success(notifications, { total, page, limit, unreadCount } as Record<string, number>);
    } catch (e) {
        console.error("GET /api/notifications error:", e);
        return error("Failed to fetch notifications", 500);
    }
}

// POST /api/notifications - Create notification
export async function POST(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const body = await req.json();
        const { userId, type, title, message, dealId, taskId, metaJson } = body;

        if (!userId || !type || !title || !message) {
            return error("userId, type, title, and message are required");
        }

        const notification = await prisma.notification.create({
            data: {
                orgId,
                userId,
                type: type as NotificationType,
                title,
                message,
                dealId,
                taskId,
                metaJson,
            },
            include: {
                deal: { select: { id: true, name: true } },
            },
        });

        return success(notification);
    } catch (e) {
        console.error("POST /api/notifications error:", e);
        return error("Failed to create notification", 500);
    }
}

// PATCH /api/notifications - Mark notifications as read (bulk)
export async function PATCH(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const body = await req.json();
        const { notificationIds, markAllRead, userId } = body;

        if (markAllRead && userId) {
            // Mark all notifications as read for user
            await prisma.notification.updateMany({
                where: { orgId, userId, read: false },
                data: { read: true },
            });
            return success({ markedAllRead: true });
        }

        if (notificationIds && Array.isArray(notificationIds)) {
            await prisma.notification.updateMany({
                where: { id: { in: notificationIds }, orgId },
                data: { read: true },
            });
            return success({ marked: notificationIds.length });
        }

        return error("notificationIds or markAllRead with userId required");
    } catch (e) {
        console.error("PATCH /api/notifications error:", e);
        return error("Failed to update notifications", 500);
    }
}
