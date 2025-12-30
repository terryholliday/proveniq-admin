import { PrismaClient, DealStage, ForecastCategory, Segment, Persona, StakeholderRoleInDeal, EvidenceCategory, EvidenceStatus, DriState, PovStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Clean existing data (in reverse dependency order)
    await prisma.enforcementEvent.deleteMany();
    await prisma.doctrineViolation.deleteMany();
    await prisma.founderOverride.deleteMany();
    await prisma.driScore.deleteMany();
    await prisma.meddpiccEvidence.deleteMany();
    await prisma.giveGetItem.deleteMany();
    await prisma.giveGetLedger.deleteMany();
    await prisma.pov.deleteMany();
    await prisma.procurement.deleteMany();
    await prisma.discountRequest.deleteMany();
    await prisma.pricingRequest.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.dealStakeholder.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.account.deleteMany();
    await prisma.sellerAuthorityRecord.deleteMany();
    await prisma.user.deleteMany();
    await prisma.org.deleteMany();

    console.log("✓ Cleaned existing data");

    // Create Organization
    const org = await prisma.org.create({
        data: {
            name: "Proveniq",
            slug: "proveniq",
        },
    });
    console.log(`✓ Created org: ${org.name}`);

    // Create Users
    const terry = await prisma.user.create({
        data: {
            orgId: org.id,
            email: "terry@proveniq.com",
            fullName: "Terry Holliday",
            roleKey: "founder",
        },
    });

    const alex = await prisma.user.create({
        data: {
            orgId: org.id,
            email: "alex@proveniq.com",
            fullName: "Alex Kim",
            roleKey: "se",
        },
    });

    console.log(`✓ Created ${2} users`);

    // Create Seller Authority for Terry
    await prisma.sellerAuthorityRecord.create({
        data: {
            orgId: org.id,
            userId: terry.id,
            certificationLevel: 3,
            certificationStatus: "ACTIVE",
            authorityScope: ["DEAL_CREATE", "DEAL_ADVANCE_STAGE", "COMMERCIAL_APPROVE_DISCOUNT"],
            strikeCount: 0,
            lastCertifiedAt: new Date(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    });

    // Create Accounts
    const accounts = await Promise.all([
        prisma.account.create({
            data: {
                orgId: org.id,
                name: "Acme Corporation",
                domain: "acme.com",
                industry: "Manufacturing",
                sizeBand: "1000-5000",
                region: "North America",
                segment: Segment.ENTERPRISE,
                tags: ["target", "q1-priority"],
            },
        }),
        prisma.account.create({
            data: {
                orgId: org.id,
                name: "TechStart Inc",
                domain: "techstart.io",
                industry: "Technology",
                sizeBand: "50-200",
                region: "North America",
                segment: Segment.MID,
                tags: ["startup", "fast-mover"],
            },
        }),
        prisma.account.create({
            data: {
                orgId: org.id,
                name: "Global Logistics Ltd",
                domain: "globallogistics.com",
                industry: "Transportation",
                sizeBand: "5000+",
                region: "EMEA",
                segment: Segment.ENTERPRISE,
                tags: ["strategic"],
            },
        }),
        prisma.account.create({
            data: {
                orgId: org.id,
                name: "FinanceHub",
                domain: "financehub.com",
                industry: "Financial Services",
                sizeBand: "200-500",
                region: "North America",
                segment: Segment.STRATEGIC,
                tags: ["fintech", "regulated"],
            },
        }),
        prisma.account.create({
            data: {
                orgId: org.id,
                name: "MegaMart",
                domain: "megamart.com",
                industry: "Retail",
                sizeBand: "5000+",
                region: "North America",
                segment: Segment.ENTERPRISE,
                tags: ["retail", "high-volume"],
            },
        }),
    ]);
    console.log(`✓ Created ${accounts.length} accounts`);

    // Create Contacts for each account
    const contactsData = [
        { accountId: accounts[0].id, name: "Sarah Chen", email: "sarah.chen@acme.com", title: "CFO", persona: Persona.CFO },
        { accountId: accounts[0].id, name: "Mike Johnson", email: "mike.johnson@acme.com", title: "VP Operations", persona: Persona.OPS },
        { accountId: accounts[0].id, name: "Lisa Park", email: "lisa.park@acme.com", title: "Director IT", persona: Persona.CIO },
        { accountId: accounts[1].id, name: "David Lee", email: "david@techstart.io", title: "CEO", persona: Persona.OTHER },
        { accountId: accounts[1].id, name: "Emma Watson", email: "emma@techstart.io", title: "Head of Ops", persona: Persona.OPS },
        { accountId: accounts[2].id, name: "Hans Mueller", email: "hans@globallogistics.com", title: "COO", persona: Persona.COO },
        { accountId: accounts[3].id, name: "Robert Chen", email: "rchen@financehub.com", title: "CRO", persona: Persona.RISK },
        { accountId: accounts[4].id, name: "Jennifer Adams", email: "jadams@megamart.com", title: "SVP Supply Chain", persona: Persona.OPS },
    ];

    const contacts = await Promise.all(
        contactsData.map((c) =>
            prisma.contact.create({
                data: { orgId: org.id, ...c },
            })
        )
    );
    console.log(`✓ Created ${contacts.length} contacts`);

    // Create Deals
    const deals = await Promise.all([
        prisma.deal.create({
            data: {
                orgId: org.id,
                accountId: accounts[0].id,
                ownerId: terry.id,
                seId: alex.id,
                name: "Acme Corp Enterprise License",
                stage: DealStage.POV,
                forecast: ForecastCategory.COMMIT,
                amountMicros: BigInt(450000 * 1_000_000),
                currency: "USD",
                termMonths: 36,
                closeDate: new Date("2025-02-15"),
                productMix: ["ClaimsIQ", "Ops", "Capital"],
                enforcementState: "OPEN",
            },
        }),
        prisma.deal.create({
            data: {
                orgId: org.id,
                accountId: accounts[1].id,
                ownerId: terry.id,
                name: "TechStart Series B",
                stage: DealStage.PROPOSAL,
                forecast: ForecastCategory.BEST_CASE,
                amountMicros: BigInt(120000 * 1_000_000),
                currency: "USD",
                termMonths: 12,
                closeDate: new Date("2025-01-30"),
                productMix: ["Ops"],
                enforcementState: "OPEN",
            },
        }),
        prisma.deal.create({
            data: {
                orgId: org.id,
                accountId: accounts[2].id,
                ownerId: terry.id,
                seId: alex.id,
                name: "Global Logistics Platform",
                stage: DealStage.DISCOVERY,
                forecast: ForecastCategory.PIPELINE,
                amountMicros: BigInt(280000 * 1_000_000),
                currency: "USD",
                termMonths: 24,
                closeDate: new Date("2025-03-20"),
                productMix: ["Transit", "Ops"],
                enforcementState: "OPEN",
            },
        }),
        prisma.deal.create({
            data: {
                orgId: org.id,
                accountId: accounts[3].id,
                ownerId: terry.id,
                name: "FinanceHub Pro License",
                stage: DealStage.LEGAL,
                forecast: ForecastCategory.COMMIT,
                amountMicros: BigInt(195000 * 1_000_000),
                currency: "USD",
                termMonths: 24,
                closeDate: new Date("2025-01-20"),
                productMix: ["Capital", "ClaimsIQ"],
                enforcementState: "FROZEN",
                frozenReasonCode: "DRI_RED_REQUIRES_ESCALATION",
            },
        }),
        prisma.deal.create({
            data: {
                orgId: org.id,
                accountId: accounts[4].id,
                ownerId: terry.id,
                seId: alex.id,
                name: "MegaMart Retail Chain",
                stage: DealStage.PROCUREMENT,
                forecast: ForecastCategory.COMMIT,
                amountMicros: BigInt(340000 * 1_000_000),
                currency: "USD",
                termMonths: 36,
                closeDate: new Date("2025-02-01"),
                productMix: ["Ops", "Home"],
                enforcementState: "OPEN",
            },
        }),
    ]);
    console.log(`✓ Created ${deals.length} deals`);

    // Create Deal Stakeholders
    await prisma.dealStakeholder.createMany({
        data: [
            { orgId: org.id, dealId: deals[0].id, contactId: contacts[0].id, roleInDeal: StakeholderRoleInDeal.ECONOMIC_BUYER, authorityLevel: 3 },
            { orgId: org.id, dealId: deals[0].id, contactId: contacts[1].id, roleInDeal: StakeholderRoleInDeal.CHAMPION, authorityLevel: 2 },
            { orgId: org.id, dealId: deals[0].id, contactId: contacts[2].id, roleInDeal: StakeholderRoleInDeal.TECH_EVAL, authorityLevel: 1 },
            { orgId: org.id, dealId: deals[1].id, contactId: contacts[3].id, roleInDeal: StakeholderRoleInDeal.ECONOMIC_BUYER, authorityLevel: 3 },
            { orgId: org.id, dealId: deals[1].id, contactId: contacts[4].id, roleInDeal: StakeholderRoleInDeal.CHAMPION, authorityLevel: 2 },
        ],
    });
    console.log("✓ Created deal stakeholders");

    // Create MEDDPICC Evidence for first deal
    const meddpiccData = [
        { category: EvidenceCategory.METRICS, status: EvidenceStatus.BUYER_CONFIRMED, notes: "20% reduction in claims processing time confirmed by CFO" },
        { category: EvidenceCategory.ECONOMIC_BUYER, status: EvidenceStatus.EVIDENCED, notes: "CFO Sarah Chen confirmed as EB" },
        { category: EvidenceCategory.DECISION_CRITERIA, status: EvidenceStatus.EVIDENCED, notes: "Security, integration, pricing confirmed" },
        { category: EvidenceCategory.DECISION_PROCESS, status: EvidenceStatus.CLAIMED, notes: "Eval → Legal → Procurement → Sign" },
        { category: EvidenceCategory.PAPER_PROCESS, status: EvidenceStatus.MISSING, notes: null },
        { category: EvidenceCategory.CHAMPION, status: EvidenceStatus.BUYER_CONFIRMED, notes: "VP Ops Mike Johnson actively selling internally" },
        { category: EvidenceCategory.COMPETITION, status: EvidenceStatus.EVIDENCED, notes: "Incumbent: legacy system, Competitor: TrustCorp" },
    ];

    await Promise.all(
        meddpiccData.map((m) =>
            prisma.meddpiccEvidence.create({
                data: {
                    orgId: org.id,
                    dealId: deals[0].id,
                    category: m.category,
                    status: m.status,
                    notes: m.notes,
                    lastUpdatedById: terry.id,
                },
            })
        )
    );
    console.log("✓ Created MEDDPICC evidence");

    // Create POV for first deal
    await prisma.pov.create({
        data: {
            orgId: org.id,
            dealId: deals[0].id,
            status: PovStatus.ACTIVE,
            startDate: new Date("2025-01-05"),
            endDate: new Date("2025-02-05"),
            charterDocRef: "doc:pov-charter-acme-2025",
            scopeLocked: true,
            successCriteriaDefined: true,
            successCriteriaBuyerConfirmed: true,
            killCriteriaDefined: true,
            killCriteriaBuyerConfirmed: false,
            successCriteriaJson: {
                criteria: [
                    "Process 100 claims end-to-end",
                    "Achieve <2 hour average processing time",
                    "Zero data integrity issues",
                ],
            },
        },
    });
    console.log("✓ Created POV");

    // Create DRI Scores
    await Promise.all([
        prisma.driScore.create({
            data: {
                orgId: org.id,
                dealId: deals[0].id,
                total: 85,
                state: DriState.GREEN,
                componentBreakdown: {
                    metrics: 15,
                    economicBuyer: 12,
                    decisionCriteria: 10,
                    decisionProcess: 8,
                    paperProcess: 5,
                    champion: 20,
                    competition: 15,
                },
            },
        }),
        prisma.driScore.create({
            data: {
                orgId: org.id,
                dealId: deals[1].id,
                total: 62,
                state: DriState.YELLOW,
                componentBreakdown: {
                    metrics: 10,
                    economicBuyer: 12,
                    decisionCriteria: 8,
                    decisionProcess: 6,
                    paperProcess: 6,
                    champion: 12,
                    competition: 8,
                },
                blockersJson: { blockers: ["Paper process unclear"] },
            },
        }),
        prisma.driScore.create({
            data: {
                orgId: org.id,
                dealId: deals[3].id,
                total: 45,
                state: DriState.RED,
                componentBreakdown: {
                    metrics: 8,
                    economicBuyer: 5,
                    decisionCriteria: 8,
                    decisionProcess: 4,
                    paperProcess: 0,
                    champion: 10,
                    competition: 10,
                },
                blockersJson: { blockers: ["No economic buyer access", "Legal pushing back on terms"] },
            },
        }),
    ]);
    console.log("✓ Created DRI scores");

    // Create Activities
    await prisma.activity.createMany({
        data: [
            { orgId: org.id, dealId: deals[0].id, accountId: accounts[0].id, type: "MEETING", occurredAt: new Date("2025-01-10"), summary: "POV kickoff meeting with stakeholders" },
            { orgId: org.id, dealId: deals[0].id, accountId: accounts[0].id, type: "CALL", occurredAt: new Date("2025-01-08"), summary: "Discovery call with CFO - confirmed budget" },
            { orgId: org.id, dealId: deals[0].id, accountId: accounts[0].id, type: "EMAIL", occurredAt: new Date("2025-01-05"), summary: "Sent proposal document" },
            { orgId: org.id, dealId: deals[0].id, accountId: accounts[0].id, type: "NOTE", occurredAt: new Date("2025-01-03"), summary: "Competitor analysis completed" },
            { orgId: org.id, dealId: deals[1].id, accountId: accounts[1].id, type: "CALL", occurredAt: new Date("2025-01-09"), summary: "Initial discovery with CEO" },
            { orgId: org.id, dealId: deals[2].id, accountId: accounts[2].id, type: "MEETING", occurredAt: new Date("2025-01-07"), summary: "Intro meeting with COO Hans" },
        ],
    });
    console.log("✓ Created activities");

    console.log("\n✅ Seed complete!");
    console.log(`
Summary:
- 1 Organization (Proveniq)
- 2 Users (Terry, Alex)
- ${accounts.length} Accounts
- ${contacts.length} Contacts
- ${deals.length} Deals
- MEDDPICC evidence, POV, DRI scores, and activities
  `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
