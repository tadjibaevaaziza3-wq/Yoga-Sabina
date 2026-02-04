import { bot } from '@/lib/telegram/bot'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        await bot.handleUpdate(body)
        return NextResponse.json({ ok: true })
    } catch (err: any) {
        console.error('Error in Telegram webhook:', err)
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
}

// For GET requests, we can return a simple status
export async function GET() {
    return new Response('Telegram Bot is active')
}
