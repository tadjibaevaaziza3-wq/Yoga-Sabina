/**
 * Retention Automation Cron Endpoint
 * GET /api/admin/automations/cron?secret=<CRON_SECRET>
 * 
 * Flow: engagement recalc → cancel active → check triggers → process queue
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkTriggers, processQueue, cancelIfActive } from '@/lib/automationService'
import { recalculateAllEngagement } from '@/lib/engagementService'

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // 1. Recalculate engagement scores & segments
        const engagement = await recalculateAllEngagement()

        // 2. Cancel pending for re-activated users
        const cancelled = await cancelIfActive()

        // 3. Check triggers and enqueue new users
        const triggers = await checkTriggers()

        // 4. Process pending queue (send messages)
        const queue = await processQueue()

        return NextResponse.json({
            success: true,
            engagement,
            cancelled,
            triggers,
            queue,
            timestamp: new Date().toISOString(),
        })
    } catch (error: any) {
        console.error('[Cron] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
