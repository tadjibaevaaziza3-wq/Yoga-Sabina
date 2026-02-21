import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { code, courseId, amount } = await req.json()

        if (!code || !courseId || !amount) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        })

        if (!coupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 })
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Coupon has expired" }, { status: 400 })
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 })
        }

        if (coupon.courseId && coupon.courseId !== courseId) {
            return NextResponse.json({ error: "Coupon is not valid for this course" }, { status: 400 })
        }

        let discountAmount = 0
        if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = (amount * Number(coupon.discountValue)) / 100
        } else {
            discountAmount = Number(coupon.discountValue)
        }

        // Clip discount to total amount
        discountAmount = Math.min(discountAmount, amount)

        return NextResponse.json({
            success: true,
            discountAmount,
            couponId: coupon.id,
            finalAmount: amount - discountAmount
        })

    } catch (error) {
        console.error('Coupon validation error:', error)
        return NextResponse.json({ error: "Validation failed" }, { status: 500 })
    }
}
