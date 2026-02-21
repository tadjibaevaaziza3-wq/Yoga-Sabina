import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

import { isAdmin } from '@/lib/auth/server'

export async function GET(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Get all users
        const allUsers = await prisma.user.findMany({
            include: {
                profile: true,
                purchases: true,
                subscriptions: {
                    where: {
                        status: 'ACTIVE'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Filter to only leads (users without active subscriptions or purchases)
        const leads = allUsers.filter(user => {
            const hasActiveSubscription = user.subscriptions.length > 0
            const hasPurchases = user.purchases.length > 0
            return !hasActiveSubscription && !hasPurchases
        })

        // Calculate metrics
        const totalUsers = allUsers.length
        const totalLeads = leads.length
        const totalCustomers = totalUsers - totalLeads
        const conversionRate = totalUsers > 0 ? ((totalCustomers / totalUsers) * 100).toFixed(2) : 0

        // Enrich leads with additional info
        const enrichedLeads = leads.map(lead => {
            const daysSinceRegistration = Math.floor(
                (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            )

            return {
                ...lead,
                daysSinceRegistration
            }
        })

        return NextResponse.json({
            success: true,
            leads: enrichedLeads,
            metrics: {
                totalLeads,
                totalCustomers,
                totalUsers,
                conversionRate: `${conversionRate}%`
            }
        })
    } catch (error: any) {
        console.error('Error fetching leads:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
