import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, getPagination } from "@/lib/api-utils";

// GET /api/orgs - List all orgs
export async function GET(req: NextRequest) {
    try {
        const { skip, take, page, limit } = getPagination(req);

        const [orgs, total] = await Promise.all([
            prisma.org.findMany({
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: { users: true, accounts: true, deals: true },
                    },
                },
            }),
            prisma.org.count(),
        ]);

        return success(orgs, { total, page, limit });
    } catch (e) {
        console.error("GET /api/orgs error:", e);
        return error("Failed to fetch orgs", 500);
    }
}

// POST /api/orgs - Create new org
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, slug } = body;

        if (!name || !slug) {
            return error("name and slug are required");
        }

        // Check slug uniqueness
        const existing = await prisma.org.findUnique({ where: { slug } });
        if (existing) {
            return error("Slug already exists");
        }

        const org = await prisma.org.create({
            data: { name, slug },
        });

        return success(org);
    } catch (e) {
        console.error("POST /api/orgs error:", e);
        return error("Failed to create org", 500);
    }
}
