import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { success, error, getPagination, requireOrgId } from "@/lib/api-utils";
import { Segment } from "@prisma/client";

// GET /api/accounts - List accounts (org-scoped)
export async function GET(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const url = new URL(req.url);
        const { skip, take, page, limit } = getPagination(req);

        const segment = url.searchParams.get("segment") as Segment | null;
        const search = url.searchParams.get("search");

        const where = {
            orgId,
            ...(segment && { segment }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { domain: { contains: search, mode: "insensitive" as const } },
                ],
            }),
        };

        const [accounts, total] = await Promise.all([
            prisma.account.findMany({
                where,
                skip,
                take,
                orderBy: { name: "asc" },
                include: {
                    _count: {
                        select: { contacts: true, deals: true },
                    },
                },
            }),
            prisma.account.count({ where }),
        ]);

        return success(accounts, { total, page, limit });
    } catch (e) {
        console.error("GET /api/accounts error:", e);
        return error("Failed to fetch accounts", 500);
    }
}

// POST /api/accounts - Create account
export async function POST(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const body = await req.json();
        const { name, domain, industry, sizeBand, region, segment, tags, notes } = body;

        if (!name) {
            return error("name is required");
        }

        const account = await prisma.account.create({
            data: {
                orgId,
                name,
                domain,
                industry,
                sizeBand,
                region,
                segment: segment || "ENTERPRISE",
                tags: tags || [],
                notes,
            },
        });

        return success(account);
    } catch (e) {
        console.error("POST /api/accounts error:", e);
        return error("Failed to create account", 500);
    }
}
