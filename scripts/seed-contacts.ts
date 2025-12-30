
import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';

// Initializing Firebase Admin
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
    } catch (e) {
        console.warn('Firebase Admin: Failed to initialize with applicationDefault. Ensure GOOGLE_APPLICATION_CREDENTIALS is set for real seeding.');
        // Do not exit here, let the main function attempt if it has a fallback or just fails there
    }
}

const db = admin.firestore();
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Admin Contacts...');

    // 1. Get the first Org from Supabase (Truth Source for Orgs)
    const org = await prisma.org.findFirst();
    if (!org) {
        console.error('No Org found in Supabase! Please seed the database first.');
        process.exit(1);
    }
    console.log(`Using Org for contacts: ${org.name} (${org.id})`);

    const contacts = [
        {
            name: "Sarah Chen",
            email: "sarah.chen@acmecorp.com",
            phone: "+1 555-0101",
            title: "VP of Operations",
            department: "Operations",
            accountId: "acc-1",
            accountName: "Acme Corporation",
            role: "CHAMPION",
            influence: "HIGH",
            sentiment: "POSITIVE",
            lastContacted: new Date(Date.now() - 86400000).toISOString(),
            linkedIn: "https://linkedin.com/in/sarahchen",
            deals: [{ id: "deal-1", name: "Acme Corp Enterprise", role: "CHAMPION" }],
            organizationId: org.id
        },
        {
            name: "Michael Johnson",
            email: "michael.j@acmecorp.com",
            phone: "+1 555-0102",
            title: "CFO",
            department: "Finance",
            accountId: "acc-1",
            accountName: "Acme Corporation",
            role: "ECONOMIC_BUYER",
            influence: "HIGH",
            sentiment: "NEUTRAL",
            lastContacted: new Date(Date.now() - 604800000).toISOString(),
            deals: [{ id: "deal-1", name: "Acme Corp Enterprise", role: "ECONOMIC_BUYER" }],
            organizationId: org.id
        },
        {
            name: "Emily Watson",
            email: "ewatson@techstart.io",
            phone: "+1 555-0201",
            title: "CTO",
            department: "Engineering",
            accountId: "acc-2",
            accountName: "TechStart Inc",
            role: "TECHNICAL_BUYER",
            influence: "HIGH",
            sentiment: "POSITIVE",
            lastContacted: new Date(Date.now() - 172800000).toISOString(),
            linkedIn: "https://linkedin.com/in/emilywatson",
            deals: [{ id: "deal-2", name: "TechStart Series A", role: "TECHNICAL_BUYER" }],
            organizationId: org.id
        }
    ];

    const collection = db.collection('admin_contacts');

    for (const c of contacts) {
        // Check if exists
        const snapshot = await collection
            .where('organizationId', '==', org.id)
            .where('email', '==', c.email)
            .get();

        if (!snapshot.empty) {
            console.log(`Contact already exists: ${c.email}`);
            continue;
        }

        await collection.add(c);
        console.log(`Created contact: ${c.name} (${c.email})`);
    }

    console.log('Contacts seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
