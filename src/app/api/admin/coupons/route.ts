import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdmin } from "@/lib/auth/server"

export async function GET() {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const coupons = await prisma.coupon.findMany({
            include: {
                course: {
                    select: {
                        title: true,
                        titleRu: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ success: true, coupons })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const { code, discountType, discountValue, maxUses, expiresAt, courseId } = body

        if (!code || !discountType || !discountValue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountType,
                discountValue,
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                courseId: courseId || null,
            }
        })

        return NextResponse.json({ success: true, coupon })
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
    }
}
