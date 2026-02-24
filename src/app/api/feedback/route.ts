import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bucket } from '@/lib/gcs/config'

export async function GET(request: NextRequest) {
    try {
        const feedback = await prisma.feedback.findMany({
            where: {
                isApproved: true
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profile: {
                            select: {
                                location: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(feedback)
    } catch (error) {
        console.error('Feedback fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || ''

        let userId: string
        let message: string
        let rating: number
        let photoUrl: string | null = null

        if (contentType.includes('multipart/form-data')) {
            // FormData with optional photo
            const formData = await request.formData()
            userId = formData.get('userId') as string
            message = formData.get('message') as string
            rating = parseInt(formData.get('rating') as string) || 5
            const photo = formData.get('photo') as File | null

            if (photo && photo.size > 0) {
                // Upload photo to GCS
                const timestamp = Date.now()
                const sanitizedName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')
                const fullPath = `feedback/${timestamp}_${sanitizedName}`

                const arrayBuffer = await photo.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                const gcsFile = bucket.file(fullPath)
                await gcsFile.save(buffer, {
                    contentType: photo.type,
                    resumable: false,
                    metadata: {
                        cacheControl: 'public, max-age=31536000',
                    },
                })

                photoUrl = `https://storage.googleapis.com/${bucket.name}/${fullPath}`
            }
        } else {
            // JSON body (backwards compatible)
            const body = await request.json()
            userId = body.userId
            message = body.message
            rating = body.rating || 5
        }

        if (!userId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const feedback = await prisma.feedback.create({
            data: {
                userId,
                message,
                rating,
                photoUrl,
                isApproved: false // Requires admin moderation
            }
        })

        return NextResponse.json({ success: true, feedback })
    } catch (error: any) {
        console.error('Feedback creation error:', error)
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }
}
