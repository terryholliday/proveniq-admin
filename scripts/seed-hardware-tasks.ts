
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Hardware Tasks...');

    // 1. Get the first Org
    const org = await prisma.org.findFirst();
    if (!org) {
        console.error('No Org found! Please seed the database first.');
        process.exit(1);
    }
    console.log(`Using Org: ${org.name} (${org.id})`);

    // 2. Get the first User (Admin)
    const adminUser = await prisma.user.findFirst({
        where: { orgId: org.id }
    });

    if (!adminUser) {
        console.error('No User found in Org! Please create a user first.');
        process.exit(1);
    }
    console.log(`Assigning tasks to User: ${adminUser.fullName} (${adminUser.id})`);

    // 3. Define Tasks
    const tasks = [
        {
            title: 'Procure NXP NTAG 424 DNA Dev Kit',
            description: 'Buy NXP NTAG 424 DNA TagTamper Development Kit (Identiv uTrust or similar) to validate SUN message generation.',
            priority: 'HIGH',
            type: 'OTHER',
            status: 'TODO',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        },
        {
            title: 'Validate SUN Message Generation',
            description: 'Use NXP RFIDDiscover or TagWriter tools to validate the SUN message and backend CMAC verification.',
            priority: 'HIGH',
            type: 'OTHER',
            status: 'TODO',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 days
        },
        {
            title: 'Procure Nordic nRF52840 Dongle',
            description: 'Purchase Nordic Semiconductor nRF52840 Dongle (PCA10059) or DK for BLE prototyping.',
            priority: 'MEDIUM',
            type: 'OTHER',
            status: 'TODO',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
        },
        {
            title: 'Develop BLE Firmware MVP',
            description: 'Flash "Proximity" example and modify it to broadcast both iBeacon packet (for iOS Wake) and custom Rolling Code.',
            priority: 'HIGH',
            type: 'OTHER',
            status: 'TODO',
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // +21 days
        },
        {
            title: 'Test iOS Background Wake',
            description: 'Verify that Region Monitoring (iBeacon) successfully wakes the app from a Force Quit state.',
            priority: 'URGENT',
            type: 'OTHER',
            status: 'TODO',
            dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // +25 days
        },
        {
            title: 'Design Rigid Tag/Hasp Enclosure',
            description: 'Begin CAD for rigid zipper pull enclosure to house NTAG 424 DNA TT and prevent flexible loop fatigue.',
            priority: 'MEDIUM',
            type: 'OTHER',
            status: 'TODO',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        }
    ];

    // 4. Insert Tasks
    for (const t of tasks) {
        const exists = await prisma.task.findFirst({
            where: {
                orgId: org.id,
                title: t.title
            }
        });

        if (exists) {
            console.log(`Task already exists: ${t.title}`);
            continue;
        }

        await prisma.task.create({
            data: {
                orgId: org.id,
                title: t.title,
                description: t.description,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                priority: t.priority as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: t.type as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: t.status as any,
                dueDate: t.dueDate,
                assignedToId: adminUser.id,
                createdById: adminUser.id,
            }
        });
        console.log(`Created task: ${t.title}`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
