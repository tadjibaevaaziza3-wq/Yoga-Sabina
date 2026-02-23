import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import { translateText } from '@/lib/translate'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')?.value
    if (!adminSession) return false
    return !!verifyToken(adminSession)
}

/**
 * POST /api/admin/translate
 * Translate text between uz and ru using Gemini Flash
 */
export async function POST(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, from, to } = await request.json()

    if (!text || !from || !to) {
        return NextResponse.json({ error: 'Missing fields: text, from, to' }, { status: 400 })
    }

    if (!['uz', 'ru'].includes(from) || !['uz', 'ru'].includes(to)) {
        return NextResponse.json({ error: 'Invalid language. Use "uz" or "ru"' }, { status: 400 })
    }

    try {
        const translated = await translateText(text, from as 'uz' | 'ru', to as 'uz' | 'ru')
        return NextResponse.json({ success: true, translated })
    } catch (error: any) {
        console.error('Translation error:', error)
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
    }
}
