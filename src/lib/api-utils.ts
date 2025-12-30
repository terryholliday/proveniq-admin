import { NextRequest, NextResponse } from "next/server";

// Standard API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
    };
}

// Helper to create success response
export function success<T>(data: T, meta?: ApiResponse<T>["meta"]): NextResponse {
    return NextResponse.json({ success: true, data, meta });
}

// Helper to create error response
export function error(message: string, status: number = 400): NextResponse {
    return NextResponse.json({ success: false, error: message }, { status });
}

// Parse pagination params
export function getPagination(req: NextRequest) {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    return { page, limit, skip, take: limit };
}

// Get orgId from headers or params (multi-tenancy support)
export function getOrgId(req: NextRequest): string | null {
    // Check header first (for API clients)
    const headerOrgId = req.headers.get("x-org-id");
    if (headerOrgId) return headerOrgId;

    // Check query param
    const url = new URL(req.url);
    return url.searchParams.get("orgId");
}

// Require orgId or return error
export function requireOrgId(req: NextRequest): { orgId: string } | NextResponse {
    const orgId = getOrgId(req);
    if (!orgId) {
        return error("Missing orgId header or parameter", 400);
    }
    return { orgId };
}
