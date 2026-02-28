import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth/admin-auth'
import ExcelJS from 'exceljs'

/**
 * GET /api/admin/users/export
 * 
 * Export users to Excel with optional filters
 */
export async function GET(request: NextRequest) {
    const admin = await getAdminFromRequest(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const role = url.searchParams.get('role') || ''
    const paymentStatus = url.searchParams.get('paymentStatus') || ''
    const courseId = url.searchParams.get('courseId') || ''
    const expiryAlarm = url.searchParams.get('expiryAlarm') || ''
    const subscriptionCount = url.searchParams.get('subscriptionCount') || ''
    const segment = url.searchParams.get('segment') || ''

    try {
        // Build where clause
        const where: any = {}
        if (q) {
            where.OR = [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } },
                { telegramUsername: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
            ]
        }
        if (role) where.role = role
        if (segment) where.segment = segment

        // Fetch users with subscriptions and purchases
        let users = await prisma.user.findMany({
            where,
            include: {
                subscriptions: {
                    include: { course: { select: { id: true, title: true } } },
                    orderBy: { startsAt: 'desc' },
                },
                purchases: {
                    select: {
                        status: true, screenshotUrl: true, verifiedByAdmin: true,
                        course: { select: { id: true, title: true } },
                    },
                },
                profile: { select: { name: true, location: true, region: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        const now = new Date()
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

        // Post-process and filter
        let processed = users.map(user => {
            const subs = user.subscriptions || []
            const purchases = user.purchases || []
            const activeSubs = subs.filter(s => s.status === 'ACTIVE' && new Date(s.endsAt) > now)
            const latestActiveSub = activeSubs.length > 0
                ? activeSubs.reduce((latest, s) => new Date(s.endsAt) > new Date(latest.endsAt) ? s : latest)
                : null
            const isExpiringSoon = latestActiveSub ? new Date(latestActiveSub.endsAt) <= threeDaysFromNow : false
            const isExpired = latestActiveSub ? new Date(latestActiveSub.endsAt) < now : false
            const hasPendingPayment = purchases.some(p => p.screenshotUrl && !p.verifiedByAdmin && p.status === 'PENDING')
            const courseNames = activeSubs.map(s => {
                const title = s.course?.title
                return typeof title === 'object' ? ((title as any)?.uz || (title as any)?.ru || '—') : (title || '—')
            }).join(', ')

            return {
                id: user.id,
                userNumber: user.userNumber,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                email: user.email || '',
                telegramId: user.telegramId || '',
                telegramUsername: user.telegramUsername || '',
                role: user.role,
                segment: user.segment,
                region: user.profile?.region || user.profile?.location || '',
                registrationSource: user.registrationSource,
                totalSubscriptions: subs.length,
                activeSubscriptions: activeSubs.length,
                courses: courseNames || '—',
                subStartDate: latestActiveSub?.startsAt || null,
                subEndDate: latestActiveSub?.endsAt || null,
                isExpiringSoon,
                isExpired,
                hasPendingPayment,
                isBlocked: user.isBlocked,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
                // For filtering
                _courseIds: subs.map(s => s.course?.id).filter(Boolean),
            }
        })

        // Apply custom filters
        if (paymentStatus === 'paid') {
            processed = processed.filter(u => u.activeSubscriptions > 0)
        } else if (paymentStatus === 'unpaid') {
            processed = processed.filter(u => u.activeSubscriptions === 0 && !u.hasPendingPayment)
        } else if (paymentStatus === 'pending') {
            processed = processed.filter(u => u.hasPendingPayment)
        }

        if (courseId) {
            processed = processed.filter(u => u._courseIds.includes(courseId))
        }

        if (expiryAlarm === 'expiring_3d') {
            processed = processed.filter(u => u.isExpiringSoon && !u.isExpired)
        } else if (expiryAlarm === 'expired') {
            processed = processed.filter(u => u.isExpired || (u.totalSubscriptions > 0 && u.activeSubscriptions === 0))
        } else if (expiryAlarm === 'active') {
            processed = processed.filter(u => u.activeSubscriptions > 0 && !u.isExpiringSoon)
        }

        if (subscriptionCount) {
            const count = parseInt(subscriptionCount, 10)
            if (count === 0) {
                processed = processed.filter(u => u.activeSubscriptions === 0)
            } else {
                processed = processed.filter(u => u.activeSubscriptions >= count)
            }
        }

        // Build Excel workbook
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Baxtli Men Admin'
        workbook.created = new Date()

        const sheet = workbook.addWorksheet('Foydalanuvchilar', {
            headerFooter: { firstHeader: 'Baxtli Men — Foydalanuvchilar' }
        })

        sheet.columns = [
            { header: '#', key: 'userNumber', width: 8 },
            { header: 'Ism', key: 'firstName', width: 15 },
            { header: 'Familiya', key: 'lastName', width: 15 },
            { header: 'Telefon', key: 'phone', width: 18 },
            { header: 'TG nomi', key: 'telegramUsername', width: 18 },
            { header: 'TG ID', key: 'telegramId', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Rol', key: 'role', width: 12 },
            { header: 'Segment', key: 'segment', width: 10 },
            { header: 'Hudud', key: 'region', width: 12 },
            { header: 'Manba', key: 'registrationSource', width: 10 },
            { header: 'Jami obuna', key: 'totalSubscriptions', width: 12 },
            { header: 'Faol obuna', key: 'activeSubscriptions', width: 12 },
            { header: 'Kurslar', key: 'courses', width: 30 },
            { header: 'Obuna boshi', key: 'subStartDate', width: 15 },
            { header: 'Obuna tugashi', key: 'subEndDate', width: 15 },
            { header: 'Bloklangan', key: 'isBlocked', width: 12 },
            { header: "Ro'yxatdan o'tgan", key: 'createdAt', width: 18 },
            { header: 'Oxirgi kirish', key: 'lastLoginAt', width: 18 },
        ]

        // Style header row
        const headerRow = sheet.getRow(1)
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF114539' } }
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
        headerRow.height = 24

        // Add data
        processed.forEach(user => {
            sheet.addRow({
                userNumber: user.userNumber,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                telegramUsername: user.telegramUsername ? `@${user.telegramUsername}` : '',
                telegramId: user.telegramId,
                email: user.email,
                role: user.role,
                segment: user.segment,
                region: user.region,
                registrationSource: user.registrationSource,
                totalSubscriptions: user.totalSubscriptions,
                activeSubscriptions: user.activeSubscriptions,
                courses: user.courses,
                subStartDate: user.subStartDate ? new Date(user.subStartDate).toLocaleDateString('uz-UZ') : '',
                subEndDate: user.subEndDate ? new Date(user.subEndDate).toLocaleDateString('uz-UZ') : '',
                isBlocked: user.isBlocked ? 'Ha' : 'Yo\'q',
                createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('uz-UZ') : '',
                lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('uz-UZ') : '',
            })
        })

        // Auto-filter
        sheet.autoFilter = { from: 'A1', to: `S${processed.length + 1}` }

        const buffer = await workbook.xlsx.writeBuffer()

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().slice(0, 10)}.xlsx"`,
            },
        })
    } catch (error: any) {
        console.error('Export error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
