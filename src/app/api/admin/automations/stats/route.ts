/**
 * Automation Statistics API
 * GET /api/admin/automations/stats?triggerId=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAutomationStats } from '@/lib/automationService'

export async function GET(request: NextRequest) {
    const triggerId = request.nextUrl.searchParams.get('triggerId')

    if (!triggerId) {
        return NextResponse.json({ error: 'triggerId required' }, { status: 400 })
    }

    try {
        const stats = await getAutomationStats(triggerId)
        return NextResponse.json(stats)
    } catch (error: any) {
        console.error('[Automation Stats] Error:', error)
        return NextResponse.json(
            { error: 'Failed to get stats', details: error.message },
            { status: 500 }
        )
    }
}
