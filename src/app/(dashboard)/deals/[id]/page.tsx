import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import DealDetailClient from "./DealDetailClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function DealDetailPage({ params }: PageProps) {
    const { id } = await params;

    const deal = await prisma.deal.findUnique({
        where: { id },
        include: {
            account: true,
            owner: true,
            se: true,
            stakeholders: {
                include: { contact: true },
            },
            meddpicc: {
                orderBy: { category: "asc" },
            },
            driScores: {
                take: 5,
            },
            activities: {
                take: 20,
                orderBy: { occurredAt: "desc" },
            },
        },
    });

    if (!deal) {
        notFound();
    }

    // Cast to any to handle Prisma's complex include types
    const d = deal as any;

    // Serialize dates for client component
    const serializedDeal = {
        id: d.id,
        name: d.name,
        stage: d.stage,
        forecast: d.forecast,
        amountMicros: d.amountMicros?.toString() || null,
        termMonths: d.termMonths,
        closeDate: d.closeDate?.toISOString() || null,
        enforcementState: d.enforcementState,
        productMix: d.productMix || [],
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        account: {
            id: d.account.id,
            name: d.account.name,
            domain: d.account.domain,
            segment: d.account.segment,
        },
        owner: d.owner ? {
            id: d.owner.id,
            fullName: d.owner.fullName,
            email: d.owner.email,
        } : null,
        se: d.se ? {
            id: d.se.id,
            fullName: d.se.fullName,
        } : null,
        stakeholders: d.stakeholders.map((s: any) => ({
            id: s.id,
            roleInDeal: s.roleInDeal,
            contact: {
                id: s.contact.id,
                name: s.contact.name,
                email: s.contact.email,
                title: s.contact.title,
                phone: s.contact.phone,
            },
        })),
        meddpicc: d.meddpicc.map((m: any) => ({
            id: m.id,
            category: m.category,
            status: m.status,
            notes: m.notes,
        })),
        driScores: d.driScores.map((dr: any) => ({
            id: dr.id,
            state: dr.state,
            total: dr.total,
            createdAt: dr.createdAt.toISOString(),
        })),
        activities: d.activities.map((a: any) => ({
            id: a.id,
            type: a.type,
            summary: a.summary,
            occurredAt: a.occurredAt.toISOString(),
        })),
    };

    return <DealDetailClient deal={serializedDeal} />;
}
