import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { error, getPagination, requireOrgId, success } from "@/lib/api-utils";

// GET /api/leads - List leads (org-scoped)
export async function GET(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const url = new URL(req.url);
        const { skip, take, page, limit } = getPagination(req);

        const search = url.searchParams.get("search");
        const status = url.searchParams.get("status");
        const source = url.searchParams.get("source");

        const where = {
            orgId,
            ...(status && { status }),
            ...(source && { source }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { email: { contains: search, mode: "insensitive" as const } },
                    { company: { contains: search, mode: "insensitive" as const } },
                    { domain: { contains: search, mode: "insensitive" as const } },
                ],
            }),
        };

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
            }),
            prisma.lead.count({ where }),
        ]);

        return success(leads, { total, page, limit });
    } catch (e) {
        console.error("GET /api/leads error:", e);
        return error("Failed to fetch leads", 500);
    }
}

// POST /api/leads - Ingest lead
export async function POST(req: NextRequest) {
    try {
        const orgCheck = requireOrgId(req);
        if (orgCheck instanceof Response) return orgCheck;
        const { orgId } = orgCheck;

        const body = await req.json();
        const {
            name,
            email,
            title,
            company,
            domain,
            source,
            status,
            notes,
            metadata,
        } = body;

        if (!name && !company && !email) {
            return error("Lead must include at least a name, company, or email");
        }

        const dedupeClauses = [];
        if (email && domain) {
            dedupeClauses.push({ email, domain });
        }
        if (email) {
            dedupeClauses.push({ email });
        }
        if (domain) {
            dedupeClauses.push({ domain });
        }

        if (dedupeClauses.length > 0) {
            const existingLead = await prisma.lead.findFirst({
                where: {
                    orgId,
                    OR: dedupeClauses,
                },
            });

            if (existingLead) {
                return success({ lead: existingLead, deduped: true });
            }
        }

        const lead = await prisma.lead.create({
            data: {
                orgId,
                name: name || company || email,
                email,
                title,
                company,
                domain,
                source,
                status: status || "NEW",
                notes,
                metadata,
            },
        });

        return success({ lead, deduped: false });
    } catch (e) {
        console.error("POST /api/leads error:", e);
        return error("Failed to create lead", 500);
    }
}
