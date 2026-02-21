/**
 * Admin AI Knowledge Base Training API
 * 
 * POST   /api/admin/ai/train - Add video transcript to RAG knowledge base
 * GET    /api/admin/ai/train - List all KB entries
 * DELETE /api/admin/ai/train - Remove a KB entry
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import { RAGEngine } from '@/lib/ai/rag-engine'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')?.value
    if (!adminSession) return false
    return !!verifyToken(adminSession)
}

/**
 * GET /api/admin/ai/train
 * List all knowledge base entries
 */
export async function GET() {
    if (!await isAdmin()) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const entries = RAGEngine.listEntries()
    return NextResponse.json({ success: true, entries })
}

/**
 * POST /api/admin/ai/train
 * Add a new entry to the knowledge base
 */
export async function POST(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, title, summary, topics, transcript } = body

        if (!title || !summary) {
            return NextResponse.json(
                { success: false, error: 'title and summary are required' },
                { status: 400 }
            )
        }

        const entryId = id || `video_${Date.now()}`

        await RAGEngine.addEntry(entryId, {
            title,
            summary,
            topics: topics || [],
            transcript: transcript || '',
        })

        return NextResponse.json({ success: true, id: entryId }, { status: 201 })
    } catch (error: any) {
        console.error('Error adding KB entry:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/ai/train
 * Remove a KB entry by id (query param)
 */
export async function DELETE(request: NextRequest) {
    if (!await isAdmin()) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 })
    }

    RAGEngine.removeEntry(id)
    return NextResponse.json({ success: true })
}
