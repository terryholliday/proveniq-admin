import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error } from "@/lib/api-utils";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/orgs/[id] - Get single org with summary stats
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const org = await prisma.org.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                        accounts: true,
                        deals: true,
                        contacts: true,
                    },
                },
            },
        });

        if (!org) {
            return error("Org not found", 404);
        }

        return success(org);
    } catch (e) {
        console.error("GET /api/orgs/[id] error:", e);
        return error("Failed to fetch org", 500);
    }
}

// PATCH /api/orgs/[id] - Update org
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, slug } = body;

        // If changing slug, check uniqueness
        if (slug) {
            const existing = await prisma.org.findFirst({
                where: { slug, NOT: { id } },
            });
            if (existing) {
                return error("Slug already in use");
            }
        }

        const org = await prisma.org.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
            },
        });

        return success(org);
    } catch (e) {
        console.error("PATCH /api/orgs/[id] error:", e);
        return error("Failed to update org", 500);
    }
}

// DELETE /api/orgs/[id] - Delete org (cascades to all related data)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await prisma.org.delete({ where: { id } });

        return success({ deleted: true });
    } catch (e) {
        console.error("DELETE /api/orgs/[id] error:", e);
        return error("Failed to delete org", 500);
    }
}
