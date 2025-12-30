
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- DIAGNOSTIC START ---");

    // 1. Total Tasks
    const totalTasks = await prisma.task.count();
    console.log(`Total Tasks in DB: ${totalTasks}`);

    // 2. Tasks by Status
    const byStatus = await prisma.task.groupBy({
        by: ["status"],
        _count: { id: true },
    });
    console.log("\nTasks by Status:");
    byStatus.forEach((g) => console.log(`- ${g.status}: ${g._count.id}`));

    // 3. Tasks by Priority
    const byPriority = await prisma.task.groupBy({
        by: ["priority"],
        _count: { id: true },
    });
    console.log("\nTasks by Priority:");
    byPriority.forEach((g) => console.log(`- ${g.priority}: ${g._count.id}`));

    // 4. Users
    const users = await prisma.user.findMany();
    console.log(`\nTotal Users: ${users.length}`);
    users.forEach((u) => console.log(`- [${u.id}] ${u.fullName} (${u.email})`));

    // 5. Tasks by Assignee
    const byAssignee = await prisma.task.groupBy({
        by: ["assignedToId"],
        _count: { id: true },
    });
    console.log("\nTasks by Assignee:");
    for (const g of byAssignee) {
        if (g.assignedToId) {
            const user = users.find(u => u.id === g.assignedToId);
            console.log(`- [${g.assignedToId}] (${user?.fullName}): ${g._count.id}`);
        } else {
            console.log(`- [Unassigned]: ${g._count.id}`);
        }
    }

    // 6. Deals
    const totalDeals = await prisma.deal.count();
    console.log(`\nTotal Deals in DB: ${totalDeals}`);

    const dealsByStage = await prisma.deal.groupBy({
        by: ["stage"],
        _count: { id: true },
    });
    dealsByStage.forEach(g => console.log(`- ${g.stage}: ${g._count.id}`));

    console.log("--- DIAGNOSTIC END ---");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
