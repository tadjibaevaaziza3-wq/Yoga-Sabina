import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createOrExtendSubscription } from '@/lib/payments/subscription'
import { getPaymeConfig } from '@/lib/payments/payme'
import { sendSubscriptionNotification } from '@/lib/telegram-bot'
import { addUserToCourseChat } from '@/lib/chat/auto-join'

/**
 * Payme Webhook Handler
 * Production-ready with Basic Auth validation and robust state tracking.
 */
export async function POST(request: Request) {
    try {
        // 1. Basic Auth Validation
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return NextResponse.json({ error: { code: -32504, message: 'Missing Authorization Header' } }, { status: 401 })
        }

        const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString()
        const [username, password] = credentials.split(':')

        // In PayMe, username is 'Paycom' and password is the secret key
        const paymeConfig = await getPaymeConfig()
        if (username !== 'Paycom' || password !== paymeConfig.secretKey) {
            return NextResponse.json({ error: { code: -32504, message: 'Invalid Credentials' } }, { status: 401 })
        }

        const body = await request.json()
        const { method, params, id: jsonRpcId } = body

        if (method === 'CheckPerformTransaction') {
            // Verify that the transaction can be performed
            const { account } = params
            const purchaseId = account.order_id

            const purchase = await prisma.purchase.findUnique({
                where: { id: purchaseId },
                include: { course: true }
            })

            if (!purchase) {
                return NextResponse.json({
                    error: {
                        code: -31050,
                        message: 'Order not found'
                    }
                })
            }

            if (purchase.status === 'PAID') {
                return NextResponse.json({
                    error: {
                        code: -31051,
                        message: 'Order already paid'
                    }
                })
            }

            return NextResponse.json({
                result: {
                    allow: true
                }
            })
        }

        if (method === 'CreateTransaction') {
            // Create a transaction record
            const { id, account, time } = params
            const purchaseId = account.order_id

            const purchase = await prisma.purchase.findUnique({
                where: { id: purchaseId }
            })

            if (!purchase) {
                return NextResponse.json({
                    error: {
                        code: -31050,
                        message: 'Order not found'
                    }
                })
            }

            // Store Payme transaction ID
            await prisma.purchase.update({
                where: { id: purchaseId },
                data: { providerTxnId: String(id) }
            })

            return NextResponse.json({
                result: {
                    create_time: time,
                    transaction: String(id),
                    state: 1
                }
            })
        }

        if (method === 'PerformTransaction') {
            // Payment is successful - create subscription
            const { id } = params

            const purchase = await prisma.purchase.findFirst({
                where: { providerTxnId: String(id) },
                include: { course: true, user: true }
            })

            if (!purchase) {
                return NextResponse.json({
                    error: {
                        code: -31003,
                        message: 'Transaction not found'
                    }
                })
            }

            // Update purchase status to PAID with audit timestamps
            const performTime = new Date()
            await prisma.purchase.update({
                where: { id: purchase.id },
                data: {
                    status: 'PAID',
                    verifiedByAdmin: true,
                    performTime
                }
            })

            // Create or extend subscription
            await createOrExtendSubscription(
                purchase.userId,
                purchase.courseId,
                purchase.course.durationDays || 30
            )

            // Send Telegram notification to user
            if (purchase.user.telegramId) {
                await sendSubscriptionNotification(
                    purchase.user.telegramId,
                    purchase.course.title,
                    (purchase.user.language as 'uz' | 'ru') || 'uz'
                )
            }

            // Create in-app notification for user panel
            await prisma.notification.create({
                data: {
                    userId: purchase.userId,
                    type: 'success',
                    title: `"${purchase.course.title}" kursiga obuna tasdiqlandi!`,
                    titleRu: `Подписка на курс "${purchase.course.titleRu || purchase.course.title}" подтверждена!`,
                    message: `To'lov muvaffaqiyatli amalga oshirildi. Endi barcha darslarni ko'rishingiz mumkin. 🎉`,
                    messageRu: `Оплата прошла успешно. Теперь вам доступны все уроки. 🎉`,
                    link: `/courses/${purchase.courseId}`,
                }
            })

            // Auto-add user to course chat
            await addUserToCourseChat(purchase.userId, purchase.courseId)

            return NextResponse.json({
                result: {
                    transaction: String(id),
                    perform_time: performTime.getTime(),
                    state: 2
                }
            })
        }

        if (method === 'CancelTransaction') {
            // Payment was cancelled
            const { id } = params

            const purchase = await prisma.purchase.findFirst({
                where: { providerTxnId: String(id) }
            })

            if (purchase) {
                const cancelTime = new Date()
                await prisma.purchase.update({
                    where: { id: purchase.id },
                    data: {
                        status: 'FAILED',
                        cancelTime,
                        reason: params.reason ? Number(params.reason) : null
                    }
                })
            }

            return NextResponse.json({
                result: {
                    transaction: String(id),
                    cancel_time: Date.now(),
                    state: -1
                }
            })
        }

        return NextResponse.json({
            error: {
                code: -32601,
                message: 'Method not found'
            }
        })

    } catch (error: any) {
        console.error('Payme webhook error:', error)
        return NextResponse.json({
            error: {
                code: -32400,
                message: error.message
            }
        }, { status: 500 })
    }
}

