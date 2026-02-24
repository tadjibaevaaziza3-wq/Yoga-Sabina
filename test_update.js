import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    try {
        const user = await prisma.user.findFirst({
            where: { email: null }
        });

        if (!user) {
            console.log("No user found with email null for test.");
            return;
        }

        console.log("Found user:", user.id);

        // Simulating the update from react-admin when email is not provided
        const updateData = {
            ...user,
            email: "", // Simulate empty string from input
        };

        delete updateData.id;

        const result = await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });

        console.log("Update successful", result.id);
    } catch (err) {
        console.error("Error during update:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
