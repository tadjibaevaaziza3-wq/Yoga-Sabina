
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function verifyPurchaseFlow() {
    console.log('--- Starting End-to-End Purchase Flow Verification ---');

    try {
        // 1. Setup Test Data
        const testEmail = `testuser_${Date.now()}@example.com`;
        const testUser = await prisma.user.create({
            data: {
                email: testEmail,
                firstName: 'Test',
                lastName: 'Purchase User',
                role: 'USER'
            }
        });
        console.log(`✅ Created Test User: ${testUser.id}`);

        const testCourse = await prisma.course.findFirst();
        if (!testCourse) {
            console.error('❌ No courses found in DB to test with.');
            return;
        }
        console.log(`✅ Using Course: ${testCourse.title} (${testCourse.id})`);

        // 2. Create Pending Purchase (Simulating Checkout)
        // We'll create it directly in DB to simulate the initiation
        const purchase = await prisma.purchase.create({
            data: {
                userId: testUser.id,
                courseId: testCourse.id,
                amount: testCourse.price,
                status: 'PENDING',
                provider: 'MOCK_PAYME',
                providerTxnId: `test_pending_${Date.now()}`
            }
        });
        console.log(`✅ Created Pending Purchase: ${purchase.id}`);

        // 3. Verify Purchase via Mock API
        console.log(`--- Calling Mock Verify API for Purchase: ${purchase.id} ---`);
        const response = await fetch(`${BASE_URL}/api/payments/mock/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ purchaseId: purchase.id })
        });
        const result = await response.json();
        console.log('Result:', result);

        if (!result.success) {
            console.error('❌ Mock Verify API failed');
            return;
        }

        // 4. Check DB for PAID Status and Subscription
        const updatedPurchase = await prisma.purchase.findUnique({
            where: { id: purchase.id }
        });
        console.log(`✅ Purchase Status: ${updatedPurchase?.status}`);

        const subscription = await prisma.subscription.findFirst({
            where: {
                userId: testUser.id,
                courseId: testCourse.id
            }
        });

        if (subscription && subscription.status === 'ACTIVE') {
            console.log(`✅ Subscription Created: ${subscription.id} (Status: ${subscription.status})`);
            console.log(`✅ Subscription Ends At: ${subscription.endsAt}`);
        } else {
            console.error('❌ Subscription not found or inactive');
        }

        console.log('\n--- Verification SUCCESSFUL ---');

    } catch (error) {
        console.error('❌ Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyPurchaseFlow();
