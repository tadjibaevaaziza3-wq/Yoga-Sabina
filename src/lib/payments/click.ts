import { prisma } from '@/lib/prisma'

export async function generateClickUrl(amount: number, params: Record<string, string>) {
    // Fetch Click config from DB
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: {
                in: ['CLICK_MERCHANT_ID', 'CLICK_SERVICE_ID', 'CLICK_SECRET_KEY']
            }
        }
    })

    const config: Record<string, string> = {
        CLICK_MERCHANT_ID: process.env.CLICK_MERCHANT_ID || 'mock_merchant_id',
        CLICK_SERVICE_ID: process.env.CLICK_SERVICE_ID || 'mock_service_id',
        CLICK_SECRET_KEY: process.env.CLICK_SECRET_KEY || 'mock_secret_key',
    }

    for (const s of settings) {
        if (s.value) {
            config[s.key] = s.value
        }
    }

    // Click expects amount in UZS
    const { merchant_trans_id } = params
    const endpoint = 'https://my.click.uz/services/pay'

    // Build Click payment URL
    const urlParams = new URLSearchParams({
        service_id: config.CLICK_SERVICE_ID,
        merchant_id: config.CLICK_MERCHANT_ID,
        amount: String(amount),
        transaction_param: merchant_trans_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`
    })

    return `${endpoint}?${urlParams.toString()}`
}
