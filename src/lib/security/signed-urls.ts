/**
 * Signed URL Management for Secure Video Delivery
 * 
 * This module handles generation and validation of time-limited signed URLs
 * for video assets stored in Google Cloud Storage.
 */

import { prisma } from '@/lib/prisma';
import { bucket } from '@/lib/gcs/config';

export interface SignedUrlResult {
    signedUrl: string;
    expiresAt: Date;
}

/**
 * Extract object path from a full GCS URL
 * e.g., https://storage.googleapis.com/bucket-name/path/to/file.mp4 -> path/to/file.mp4
 */
function extractPathFromUrl(url: string): string {
    try {
        if (!url.startsWith('http')) return url;

        const urlObj = new URL(url);
        // Format: https://storage.googleapis.com/BUCKET_NAME/OBJECT_PATH
        if (urlObj.hostname === 'storage.googleapis.com') {
            const parts = urlObj.pathname.split('/');
            // parts[0] is empty, parts[1] is bucket, rest is path
            return parts.slice(2).join('/');
        }
        return url;
    } catch (e) {
        return url;
    }
}

/**
 * Generate a signed URL for a video asset
 * 
 * @param assetId - ID of the asset (optional if lessonId provided)
 * @param lessonId - ID of the lesson (required if assetId missing)
 * @param userId - ID of the user requesting access
 * @param expiresInMinutes - Expiry time in minutes (default: 30)
 * @returns Signed URL and expiration time
 */
export async function generateSignedUrl(
    assetId: string | null,
    lessonId: string,
    userId: string,
    expiresInMinutes: number = 30,
    type: 'video' | 'audio' = 'video'
): Promise<SignedUrlResult> {

    let storagePath: string = '';
    let courseId: string = '';

    // 1. Resolve Path and Course ID
    if (assetId) {
        // Option A: Specific Asset Access
        const asset = await prisma.asset.findUnique({
            where: { id: assetId },
            include: {
                lesson: {
                    select: { courseId: true }
                }
            }
        });

        if (!asset) throw new Error('Asset not found');

        // Use storagePath if available, otherwise try to extract from valid URL
        storagePath = asset.storagePath || extractPathFromUrl(asset.url);
        if (!storagePath) throw new Error('Invalid asset path');

        courseId = asset.lesson.courseId;
    } else {
        // Option B: Main Lesson Video Access
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { videoUrl: true, audioUrl: true, courseId: true }
        });

        if (!lesson) throw new Error('Lesson not found');

        const targetUrl = type === 'audio' ? lesson.audioUrl : lesson.videoUrl;
        if (!targetUrl) throw new Error(`Lesson has no ${type}`);

        storagePath = extractPathFromUrl(targetUrl);
        courseId = lesson.courseId;
    }

    // 2. Security Checks

    // Verify user has active subscription to the course
    // Allow if user is ADMIN? (Optional, skipping for now to strict rules)
    const subscription = await prisma.subscription.findFirst({
        where: {
            userId,
            courseId: courseId,
            status: 'ACTIVE',
            endsAt: {
                gte: new Date(),
            },
        },
    });

    // Also check for purchases
    const purchase = !subscription ? await prisma.purchase.findFirst({
        where: {
            userId,
            courseId: courseId,
            status: 'PAID'
        }
    }) : null;

    if (!subscription && !purchase) {
        throw new Error('User does not have an active subscription or purchase for this course');
    }

    // Check if user has accepted the latest user agreement
    const latestAgreement = await prisma.userAgreement.findFirst({
        where: {
            userId,
            version: process.env.USER_AGREEMENT_VERSION || '1.0',
        },
    });

    if (!latestAgreement) {
        throw new Error('User must accept the user agreement before accessing videos');
    }

    // 3. Generate GCS Signed URL
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // Check if file exists? skip for performance, blind sign
    const file = bucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: expiresAt,
        extensionHeaders: {
            // 'x-goog-meta-userid': userId // Optional custom headers
        }
    });

    // 4. Cache the signed URL
    // Note: We use assetId if available, otherwise null. 
    // Ideally we should have a schema that supports lessonId in cache, but for now we might skip caching or use a composite key?
    // The current schema for SignedUrlCache likely requires assetId.
    // Let's check schema/types. If assetId is required in SignedUrlCache, we can't cache lesson-only URLs easily without a dummy asset ID.
    // For now, let's TRY to cache if assetId exists.

    if (assetId) {
        try {
            await prisma.signedUrlCache.create({
                data: {
                    userId,
                    assetId,
                    signedUrl,
                    expiresAt,
                },
            });
        } catch (e) {
            // Ignore cache errors (duplicate keys etc)
            console.warn('Failed to cache signed URL', e);
        }
    }

    return {
        signedUrl,
        expiresAt,
    };
}

/**
 * Validate if a signed URL is still valid
 * 
 * @param url - The signed URL to validate
 * @param userId - ID of the user
 * @returns true if valid, false otherwise
 */
export async function validateSignedUrl(
    url: string,
    userId: string
): Promise<boolean> {
    const cached = await prisma.signedUrlCache.findFirst({
        where: {
            signedUrl: url,
            userId,
            expiresAt: {
                gte: new Date(),
            },
        },
    });

    return !!cached;
}

/**
 * Clean up expired signed URLs from cache
 * Should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredUrls(): Promise<number> {
    const result = await prisma.signedUrlCache.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });

    return result.count;
}

/**
 * Revoke all signed URLs for a specific user
 * Useful when user's subscription is cancelled or they violate terms
 */
export async function revokeUserUrls(userId: string): Promise<number> {
    const result = await prisma.signedUrlCache.deleteMany({
        where: { userId },
    });

    return result.count;
}

/**
 * Log video access attempt
 * 
 * @param userId - ID of the user
 * @param lessonId - ID of the lesson
 * @param assetId - ID of the asset (optional)
 * @param ip - IP address of the request
 * @param userAgent - User agent string
 * @param referer - Referer header
 */
export async function logVideoAccess(
    userId: string,
    lessonId: string,
    assetId: string | null,
    ip: string | null,
    userAgent: string | null,
    referer: string | null
): Promise<void> {
    try {
        await prisma.videoAccessLog.create({
            data: {
                userId,
                lessonId,
                assetId,
                ip,
                userAgent,
                referer,
            },
        });
    } catch (e) {
        console.error('Failed to log video access', e);
    }
}
