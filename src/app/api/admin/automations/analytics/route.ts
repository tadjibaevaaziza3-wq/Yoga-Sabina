/**
 * AI Analytics API
 * GET /api/admin/automations/analytics
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEngagementAnalytics } from '@/lib/engagementService'

export async function GET() {
    try {
        const engagement = await getEngagementAnalytics()

        // Retention rate: users who returned after being queued
        const totalQueued = await prisma.triggerLog.count()
        const totalReturned = await prisma.triggerLog.count({ where: { returned: true } })
        const retentionRate = totalQueued > 0 ? Math.round((totalReturned / totalQueued) * 100) : 0

        // Best tone analysis
        const toneResults = await prisma.triggerLog.groupBy({
            by: ['metadata'],
            where: { status: 'SENT' },
            _count: true,
        })

        // AI vs non-AI comparison
        const aiSent = await prisma.triggerLog.count({ where: { aiGenerated: true } })
        const aiReturned = await prisma.triggerLog.count({ where: { aiGenerated: true, returned: true } })
        const regularSent = await prisma.triggerLog.count({ where: { aiGenerated: false } })
        const regularReturned = await prisma.triggerLog.count({ where: { aiGenerated: false, returned: true } })

        // A/B test results
        const variantATotal = await prisma.triggerLog.count({ where: { variant: 'A' } })
        const variantAReturned = await prisma.triggerLog.count({ where: { variant: 'A', returned: true } })
        const variantBTotal = await prisma.triggerLog.count({ where: { variant: 'B' } })
        const variantBReturned = await prisma.triggerLog.count({ where: { variant: 'B', returned: true } })

        return NextResponse.json({
            engagement,
            retention: {
                totalQueued,
                totalReturned,
                retentionRate,
            },
            aiVsRegular: {
                ai: { sent: aiSent, returned: aiReturned, rate: aiSent > 0 ? Math.round((aiReturned / aiSent) * 100) : 0 },
                regular: { sent: regularSent, returned: regularReturned, rate: regularSent > 0 ? Math.round((regularReturned / regularSent) * 100) : 0 },
            },
            abTest: {
                A: { total: variantATotal, returned: variantAReturned, rate: variantATotal > 0 ? Math.round((variantAReturned / variantATotal) * 100) : 0 },
                B: { total: variantBTotal, returned: variantBReturned, rate: variantBTotal > 0 ? Math.round((variantBReturned / variantBTotal) * 100) : 0 },
            },
        })
    } catch (error: any) {
        console.error('[Analytics] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
