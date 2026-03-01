
import { NextResponse } from 'next/server'

/**
 * Mock payment route — DISABLED in production.
 * This route was a critical security vulnerability that allowed
 * creating real PAID purchases without actual payment.
 */
export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Mock payments are disabled. Use real payment providers.' },
        { status: 403 }
    )
}
