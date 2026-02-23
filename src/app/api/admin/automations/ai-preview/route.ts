/**
 * AI Message Preview API
 * POST /api/admin/automations/ai-preview
 */

import { NextRequest, NextResponse } from 'next/server'
import { previewAiMessage } from '@/lib/aiRetentionService'

export async function POST(request: NextRequest) {
    try {
        const { tone, goal, basePrompt } = await request.json()
        const message = await previewAiMessage(tone || 'friendly', goal || 'return', basePrompt || null)
        return NextResponse.json({ message })
    } catch (error: any) {
        console.error('[AI Preview] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
