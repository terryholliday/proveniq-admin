import { NextResponse } from "next/server";
import { verifyServiceAuth } from "@/lib/server-auth";
import { getContacts, createContact, updateContact, deleteContact } from "@/lib/firestore/contacts";
import { getOrgId } from "@/lib/api-utils";

export async function GET(req: Request) {
    try {
        await verifyServiceAuth(req);
        const orgId = getOrgId(req as any);
        if (!orgId) return NextResponse.json({ success: false, error: "Missing orgId" }, { status: 400 });
        const contacts = await getContacts(orgId);
        return NextResponse.json({ success: true, data: contacts });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        await verifyServiceAuth(req);
        const orgId = getOrgId(req as any);
        if (!orgId) return NextResponse.json({ success: false, error: "Missing orgId" }, { status: 400 });
        const body = await req.json();
        const contact = await createContact({ ...body, organizationId: orgId });
        return NextResponse.json({ success: true, data: contact }, { status: 201 });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}

export async function PUT(req: Request) {
    try {
        await verifyServiceAuth(req);
        const orgId = getOrgId(req as any);
        if (!orgId) return NextResponse.json({ success: false, error: "Missing orgId" }, { status: 400 });
        const { id, ...updates } = await req.json();
        if (!id) return NextResponse.json({ success: false, error: "Missing contact id" }, { status: 400 });
        const updated = await updateContact(id, { ...updates, organizationId: orgId });
        return NextResponse.json({ success: true, data: updated });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}

export async function DELETE(req: Request) {
    try {
        await verifyServiceAuth(req);
        const orgId = getOrgId(req as any);
        if (!orgId) return NextResponse.json({ success: false, error: "Missing orgId" }, { status: 400 });
        const { id } = await req.json();
        if (!id) return NextResponse.json({ success: false, error: "Missing contact id" }, { status: 400 });
        await deleteContact(id);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 401 });
    }
}
