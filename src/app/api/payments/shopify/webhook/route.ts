import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Shopify Webhook Handler
 * Endpoint: /api/payments/shopify/webhook
 * 
 * Handles 'orders/paid' or 'fulfillment/create' events to grant subscriptions.
 * 
 * Security: Validates HMAC header 'X-Shopify-Hmac-Sha256' using SHOPIFY_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
    try {
        const hmacHeader = req.headers.get('X-Shopify-Hmac-Sha256');
        const topic = req.headers.get('X-Shopify-Topic');
        const rawBody = await req.text();

        // 1. Verify HMAC (if secret is configured)
        if (process.env.SHOPIFY_WEBHOOK_SECRET) {
            const hash = crypto
                .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
                .update(rawBody)
                .digest('base64');

            if (hash !== hmacHeader) {
                console.error('Available HMAC:', hash, 'Received:', hmacHeader);
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        } else {
            console.warn('SHOPIFY_WEBHOOK_SECRET not set. Skipping verification.');
        }

        const payload = JSON.parse(rawBody);

        console.log(`Received Shopify Webhook: ${topic}`, payload.id);

        if (topic === 'orders/paid' || topic === 'orders/fulfilled') {
            await handleOrderPaid(payload);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Shopify Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handleOrderPaid(order: any) {
    const email = order.email;
    const phone = order.phone || order.customer?.phone;

    if (!email && !phone) {
        console.warn('Order received without email or phone. Cannot link to user.', order.id);
        return;
    }

    // Find user
    let user = await prisma.user.findFirst({
        where: {
            OR: [
                email ? { email: { equals: email, mode: 'insensitive' } } : {},
                phone ? { phone: { equals: phone } } : {}
            ]
        }
    });

    if (!user) {
        console.warn(`User not found for Shopify Order ${order.id}. Email: ${email}, Phone: ${phone}`);
        // Optionally create user here or log for manual review
        return;
    }

    // Determine subscription duration from line items
    let monthsToAdd = 0;

    // Logic: Check product tags or SKUs
    for (const item of order.line_items) {
        const sku = item.sku?.toLowerCase() || '';
        const title = item.title?.toLowerCase() || '';

        if (sku.includes('sub-1m') || title.includes('1 month')) monthsToAdd += 1;
        else if (sku.includes('sub-3m') || title.includes('3 month')) monthsToAdd += 3;
        else if (sku.includes('sub-6m') || title.includes('6 month')) monthsToAdd += 6;
        else if (sku.includes('sub-1y') || title.includes('1 year')) monthsToAdd += 12;
        else monthsToAdd += 1; // Default fallback if item is a subscription product
    }

    if (monthsToAdd > 0) {
        // Resolve Course ID (assuming subscription is for a specific "All Access" or matching course)
        // For now, we default to a specific course ID from ENV or lookup
        const courseId = process.env.DEFAULT_SUBSCRIPTION_COURSE_ID;

        if (!courseId) {
            console.error('DEFAULT_SUBSCRIPTION_COURSE_ID not set. Cannot grant subscription.');
            return;
        }

        // Update subscription
        // Check existing active subscription for this course
        const existingSub = await prisma.subscription.findFirst({
            where: {
                userId: user.id,
                courseId: courseId,
                status: 'ACTIVE',
                endsAt: { gt: new Date() }
            }
        });

        let newEndDate = new Date();
        if (existingSub) {
            newEndDate = new Date(existingSub.endsAt);
        }

        newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);

        if (existingSub) {
            await prisma.subscription.update({
                where: { id: existingSub.id },
                data: { endsAt: newEndDate }
            });
            console.log(`Extended subscription for User ${user.id} by ${monthsToAdd} months.`);
        } else {
            await prisma.subscription.create({
                data: {
                    userId: user.id,
                    courseId: courseId,
                    status: 'ACTIVE',
                    startsAt: new Date(),
                    endsAt: newEndDate
                }
            });
            console.log(`Created new ${monthsToAdd}-month subscription for User ${user.id}.`);
        }
    }
}
