import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/server'

export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const allUsers = await prisma.user.findMany({
            include: {
                profile: true,
                purchases: true,
                subscriptions: { where: { status: 'ACTIVE' } }
            }
        })

        const leads = allUsers.filter(user => {
            return user.subscriptions.length === 0 && user.purchases.length === 0
        })

        // CSV Header
        const csvRows = [
            ['ID', 'Name', 'Email', 'Phone', 'Registered At', 'Days Since Registration'].join(',')
        ]

        // Add lead rows
        leads.forEach(lead => {
            const userName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.profile?.name || 'No Name'
            const daysSinceRegistration = Math.floor(
                (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            )

            const row = [
                lead.id,
                `"${userName}"`,
                lead.email || '',
                lead.phone || '',
                new Date(lead.createdAt).toISOString(),
                daysSinceRegistration.toString()
            ]
            csvRows.push(row.join(','))
        })

        const csvContent = csvRows.join('\n')

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=leads-export.csv'
            }
        })
    } catch (error: any) {
        console.error('Error exporting leads:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
