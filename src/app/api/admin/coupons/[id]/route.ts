import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth/server"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        await prisma.coupon.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const coupon = await prisma.coupon.update({
            where: { id },
            data: body
        })
        return NextResponse.json({ success: true, coupon })
    } catch (error) {
        return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
    }
}
