import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOrExtendSubscription } from '@/lib/payments/subscription'
import crypto from 'crypto'

/**
 * Click Webhook Handler
 * Receives notifications from Click payment system
 * Automatically creates subscriptions on successful payment
 */
export async function POST(request: Request) {
    try {
        const body = await request.json()

        const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id, // This is our purchase ID
            amount,
            action,
            error,
            error_note,
            sign_time,
            sign_string
        } = body

        // Verify signature (if CLICK_SECRET_KEY is configured)
        if (process.env.CLICK_SECRET_KEY) {
            const signString = `${click_trans_id}${service_id}${process.env.CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
            const expectedSign = crypto.createHash('md5').update(signString).digest('hex')

            if (expectedSign !== sign_string) {
                return NextResponse.json({
                    error: -1,
                    error_note: 'Invalid signature'
                })
            }
        }

        const purchaseId = merchant_trans_id

        // Action 0 = prepare (check if order exists)
        if (action === 0) {
            const purchase = await prisma.purchase.findUnique({
                where: { id: purchaseId },
                include: { course: true }
            })

            if (!purchase) {
                return NextResponse.json({
                    error: -5,
                    error_note: 'Order not found'
                })
            }

            if (purchase.status === 'PAID') {
                return NextResponse.json({
                    error: -4,
                    error_note: 'Order already paid'
                })
            }

            // Check if amount matches
            const expectedAmount = Number(purchase.amount)
            if (Number(amount) !== expectedAmount) {
                return NextResponse.json({
                    error: -2,
                    error_note: 'Incorrect amount'
                })
            }

            // Store Click transaction ID
            await prisma.purchase.update({
                where: { id: purchaseId },
                data: { providerTxnId: String(click_trans_id) }
            })

            return NextResponse.json({
                click_trans_id,
                merchant_trans_id: purchaseId,
                merchant_prepare_id: Date.now(),
                error: 0,
                error_note: 'Success'
            })
        }

        // Action 1 = complete (payment successful)
        if (action === 1) {
            const purchase = await prisma.purchase.findUnique({
                where: { id: purchaseId },
                include: { course: true, user: true }
            })

            if (!purchase) {
                return NextResponse.json({
                    error: -5,
                    error_note: 'Order not found'
                })
            }

            if (purchase.status === 'PAID') {
                // Already processed
                return NextResponse.json({
                    click_trans_id,
                    merchant_trans_id: purchaseId,
                    merchant_confirm_id: Date.now(),
                    error: 0,
                    error_note: 'Already paid'
                })
            }

            // Update purchase status
            await prisma.purchase.update({
                where: { id: purchaseId },
                data: {
                    status: 'PAID',
                    providerTxnId: String(click_trans_id)
                }
            })

            // Create or extend subscription
            await createOrExtendSubscription(
                purchase.userId,
                purchase.courseId,
                purchase.course.durationDays || 30
            )

            return NextResponse.json({
                click_trans_id,
                merchant_trans_id: purchaseId,
                merchant_confirm_id: Date.now(),
                error: 0,
                error_note: 'Success'
            })
        }

        return NextResponse.json({
            error: -3,
            error_note: 'Unknown action'
        })

    } catch (error: any) {
        console.error('Click webhook error:', error)
        return NextResponse.json({
            error: -8,
            error_note: error.message
        }, { status: 500 })
    }
}

