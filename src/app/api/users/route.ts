import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, getPagination, requireOrgId } from "@/lib/api-utils";

// GET /api/users - List users (org-scoped)
export async function GET(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const { skip, take, page, limit } = getPagination(req);

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: { orgId },
                skip,
                take,
                orderBy: { createdAt: "desc" },
                include: {
                    authority: true,
                    _count: {
                        select: { ownedDeals: true, violations: true },
                    },
                },
            }),
            prisma.user.count({ where: { orgId } }),
        ]);

        return success(users, { total, page, limit });
    } catch (e) {
        console.error("GET /api/users error:", e);
        return error("Failed to fetch users", 500);
    }
}

// POST /api/users - Create user
export async function POST(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const body = await req.json();
        const { email, fullName, roleKey } = body;

        if (!email || !fullName) {
            return error("email and fullName are required");
        }

        // Check email uniqueness within org
        const existing = await prisma.user.findUnique({
            where: { orgId_email: { orgId, email } },
        });
        if (existing) {
            return error("User with this email already exists in org");
        }

        const user = await prisma.user.create({
            data: { orgId, email, fullName, roleKey },
        });

        return success(user);
    } catch (e) {
        console.error("POST /api/users error:", e);
        return error("Failed to create user", 500);
    }
}
