import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getLocalUser } from "@/lib/auth/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { lessonId } = await params

        const favorite = await prisma.favoriteLesson.findUnique({
            where: {
                lessonId_userId: {
                    lessonId,
                    userId: user.id,
                },
            },
        })

        return NextResponse.json({
            favorited: !!favorite,
        })
    } catch (error) {
        console.error("Error fetching favorite status:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { lessonId } = await params

        // Check course access
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { courseId: true }
        })

        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
        }

        const [subscription, purchase] = await Promise.all([
            prisma.subscription.findFirst({
                where: { userId: user.id, courseId: lesson.courseId, status: "ACTIVE", endsAt: { gt: new Date() } }
            }),
            prisma.purchase.findFirst({
                where: { userId: user.id, courseId: lesson.courseId, status: "PAID" }
            })
        ])

        if (!subscription && !purchase && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "No access to this course" }, { status: 403 })
        }

        await prisma.favoriteLesson.upsert({
            where: {
                lessonId_userId: {
                    lessonId,
                    userId: user.id,
                },
            },
            update: {},
            create: {
                lessonId,
                userId: user.id,
            },
        })

        return NextResponse.json({ success: true, favorited: true })
    } catch (error) {
        console.error("Error favoriting lesson:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ lessonId: string }> }
) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { lessonId } = await params

        // Check access (consistency)
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { courseId: true }
        })

        if (!lesson) {
            return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
        }

        try {
            await prisma.favoriteLesson.delete({
                where: {
                    lessonId_userId: {
                        lessonId,
                        userId: user.id,
                    },
                },
            })
        } catch (e) {
            // Ignore if not found
        }

        return NextResponse.json({ success: true, favorited: false })
    } catch (error) {
        console.error("Error unfavoriting lesson:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
