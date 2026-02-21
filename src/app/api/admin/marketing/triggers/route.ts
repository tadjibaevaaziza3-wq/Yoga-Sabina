import { NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import { prisma } from "@/lib/prisma"

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function GET(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const triggers = await prisma.trigger.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(triggers)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const trigger = await prisma.trigger.create({
            data: body
        })
        return NextResponse.json(trigger)
    } catch (error) {
        console.error("Create Trigger Error", error)
        return NextResponse.json({ error: "Failed" }, { status: 500 })
    }
}
