import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function getAdmin() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')?.value
    if (!session) return null
    return verifyToken(session)
}

/**
 * Secure chat file upload - converts to base64 data URL instead of uploading to GCS.
 * This prevents files from being publicly accessible on storage.googleapis.com.
 * Files are stored inline as data: URIs in the attachmentUrl field.
 * 
 * Max file size: 5MB (base64 encoded ~6.7MB stored in DB)
 */
export async function POST(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Security: 5MB limit for chat attachments
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `Fayl juda katta. Maksimal hajm: 5MB` }, { status: 400 })
    }

    // Security: Only allow safe file types
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm',
        'audio/mpeg', 'audio/ogg', 'audio/wav',
        'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Bu fayl turi ruxsat etilmaydi: ${file.type}` }, { status: 400 })
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const base64 = buffer.toString('base64')
        const dataUrl = `data:${file.type};base64,${base64}`

        return NextResponse.json({
            success: true,
            dataUrl,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
        })
    } catch (error: any) {
        console.error('Chat upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
