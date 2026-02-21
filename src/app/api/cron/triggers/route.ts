import { NextResponse } from "next/server"
import { TriggerEngine } from "@/lib/automation/trigger-engine"

export async function GET(req: Request) {
    // Security: Check for CRON_SECRET header to prevent unauthorized access
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await TriggerEngine.run()
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Trigger Engine Failed:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
