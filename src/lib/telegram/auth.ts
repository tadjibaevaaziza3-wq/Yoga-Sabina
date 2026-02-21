import crypto from 'crypto'

export interface TelegramUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    photo_url?: string
}

export interface ValidatedData {
    user: TelegramUser
    auth_date: number
    hash: string
    query_id?: string
    chat_instance?: string
    start_param?: string
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

function getTelegramSecretKey(): Buffer {
    if (!BOT_TOKEN) {
        throw new Error('TELEGRAM_BOT_TOKEN is not set')
    }
    return crypto
        .createHmac('sha256', 'WebAppData')
        .update(BOT_TOKEN)
        .digest()
}

export function validateTelegramData(initData: string): ValidatedData | null {
    if (!BOT_TOKEN) {
        console.error('TELEGRAM_BOT_TOKEN is not set')
        return null
    }

    try {
        const urlParams = new URLSearchParams(initData)
        const hash = urlParams.get('hash')

        if (!hash) return null

        // Create a copy without hash
        const dataCheckArr: string[] = []
        urlParams.forEach((value, key) => {
            if (key !== 'hash') {
                dataCheckArr.push(`${key}=${value}`)
            }
        })

        // Sort alphabetically
        dataCheckArr.sort()
        const dataCheckString = dataCheckArr.join('\n')

        const secretKey = getTelegramSecretKey()

        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex')

        if (calculatedHash !== hash) {
            console.warn('Invalid Telegram Hash')
            return null
        }

        // Parse user data
        const userStr = urlParams.get('user')
        if (!userStr) return null

        const user = JSON.parse(userStr) as TelegramUser
        const auth_date = parseInt(urlParams.get('auth_date') || '0', 10)

        // Optional: Check if auth_date is too old (e.g. > 1 day)
        // const now = Math.floor(Date.now() / 1000);
        // if (now - auth_date > 86400) return null;

        return {
            user,
            auth_date,
            hash,
            query_id: urlParams.get('query_id') || undefined,
            chat_instance: urlParams.get('chat_instance') || undefined,
            start_param: urlParams.get('start_param') || undefined
        }
    } catch (e) {
        console.error('Failed to validate/parse Telegram data', e)
        return null
    }
}
