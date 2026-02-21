import { prisma } from '@/lib/prisma'

export async function getPaymeConfig() {
    const settings = await prisma.systemSetting.findMany({
        where: { key: { in: ['PAYME_MERCHANT_ID', 'PAYME_SECRET_KEY'] } }
    })

    let merchantId = process.env.PAYME_MERCHANT_ID || 'mock_merchant_id';
    let secretKey = process.env.PAYME_SECRET_KEY || 'mock_secret_key';

    for (const s of settings) {
        if (s.key === 'PAYME_MERCHANT_ID' && s.value) merchantId = s.value;
        if (s.key === 'PAYME_SECRET_KEY' && s.value) secretKey = s.value;
    }

    return {
        merchantId,
        secretKey,
        endpoint: 'https://checkout.paycom.uz',
    }
}

export async function generatePaymeUrl(amountInTiyn: number, account: Record<string, string>) {
    const config = await getPaymeConfig();
    let accountStr = ''
    for (const [key, value] of Object.entries(account)) {
        accountStr += `;${key}=${value}`
    }

    if (config.merchantId === 'mock_merchant_id') {
        return `/tma/payment-success?amount=${amountInTiyn / 100}`
    }

    const params = `m=${config.merchantId};ac${accountStr};a=${amountInTiyn};c=uz`
    const encodedParams = Buffer.from(params).toString('base64');
    return `${config.endpoint}/${encodedParams}`
}
