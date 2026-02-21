import { MasterAgent } from '@/lib/ai/master-agent'
import { NextResponse } from 'next/server'
import { getLocalUser } from '@/lib/auth/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { message, lang = 'uz', history = [] } = body

        if (!message) {
            return NextResponse.json({ error: 'No message provided' }, { status: 400 })
        }

        // Validate User Session (Optional for Chat)
        const user = await getLocalUser()

        const response = await MasterAgent.processRequest(message, lang, user?.id, history)

        return NextResponse.json({
            success: true,
            response: response.content,
            metadata: response.metadata
        })

    } catch (error: any) {
        console.error('AI Chat Error:', error)
        return NextResponse.json({ success: false, error: 'AI unavailable' }, { status: 500 })
    }
}
