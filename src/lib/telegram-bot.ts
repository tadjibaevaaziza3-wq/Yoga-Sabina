/**
 * Telegram Bot Helper
 * 
 * Sends messages via Telegram Bot API for OTP verification,
 * subscription notifications, etc.
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!BOT_TOKEN) {
    console.warn('[Telegram Bot] TELEGRAM_BOT_TOKEN not set in .env')
}

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`

interface TelegramResponse {
    ok: boolean
    result?: any
    description?: string
}

/**
 * Send a text message to a Telegram user
 */
export async function sendTelegramMessage(
    chatId: string | number,
    text: string,
    parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
    if (!BOT_TOKEN) {
        console.error('[Telegram Bot] No bot token configured')
        return false
    }

    try {
        const response = await fetch(`${API_BASE}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: parseMode
            })
        })

        const data: TelegramResponse = await response.json()

        if (!data.ok) {
            console.error('[Telegram Bot] Send failed:', data.description)
            return false
        }

        return true
    } catch (error) {
        console.error('[Telegram Bot] Error sending message:', error)
        return false
    }
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP code via Telegram
 */
export async function sendOTP(
    telegramId: string | number,
    code: string,
    lang: 'uz' | 'ru' = 'uz'
): Promise<boolean> {
    const message = lang === 'uz'
        ? `🔐 <b>Baxtli Men — Tasdiqlash Kodi</b>\n\nSizning kodingiz: <code>${code}</code>\n\n⏱ Kod 5 daqiqa amal qiladi.\n⚠️ Bu kodni hech kimga bermang!`
        : `🔐 <b>Baxtli Men — Код подтверждения</b>\n\nВаш код: <code>${code}</code>\n\n⏱ Код действует 5 минут.\n⚠️ Никому не сообщайте этот код!`

    return sendTelegramMessage(telegramId, message)
}

/**
 * Send subscription notification
 */
export async function sendSubscriptionNotification(
    telegramId: string | number,
    courseName: string,
    lang: 'uz' | 'ru' = 'uz'
): Promise<boolean> {
    const message = lang === 'uz'
        ? `✅ <b>Obuna tasdiqlandi!</b>\n\n📚 Kurs: ${courseName}\n🎯 Endi barcha darslarni ko'rishingiz mumkin.\n\nBaxtli bo'ling! 🧘‍♀️`
        : `✅ <b>Подписка подтверждена!</b>\n\n📚 Курс: ${courseName}\n🎯 Теперь вам доступны все уроки.\n\nБудьте счастливы! 🧘‍♀️`

    return sendTelegramMessage(telegramId, message)
}

/**
 * Send a video to a Telegram user
 */
export async function sendTelegramVideo(
    chatId: string | number,
    videoUrl: string,
    caption?: string
): Promise<boolean> {
    if (!BOT_TOKEN) {
        console.error('[Telegram Bot] No bot token configured')
        return false
    }

    try {
        const response = await fetch(`${API_BASE}/sendVideo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                video: videoUrl,
                caption: caption || '',
                parse_mode: 'HTML'
            })
        })

        const data: TelegramResponse = await response.json()

        if (!data.ok) {
            console.error('[Telegram Bot] Video send failed:', data.description)
            return false
        }

        return true
    } catch (error) {
        console.error('[Telegram Bot] Error sending video:', error)
        return false
    }
}

/**
 * Send an audio file to a Telegram user
 */
export async function sendTelegramAudio(
    chatId: string | number,
    audioUrl: string,
    caption?: string
): Promise<boolean> {
    if (!BOT_TOKEN) {
        console.error('[Telegram Bot] No bot token configured')
        return false
    }

    try {
        const response = await fetch(`${API_BASE}/sendAudio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                audio: audioUrl,
                caption: caption || '',
                parse_mode: 'HTML'
            })
        })

        const data: TelegramResponse = await response.json()

        if (!data.ok) {
            console.error('[Telegram Bot] Audio send failed:', data.description)
            return false
        }

        return true
    } catch (error) {
        console.error('[Telegram Bot] Error sending audio:', error)
        return false
    }
}

/**
 * Send a photo to a Telegram user
 */
export async function sendTelegramPhoto(
    chatId: string | number,
    photoUrl: string,
    caption?: string
): Promise<boolean> {
    if (!BOT_TOKEN) {
        console.error('[Telegram Bot] No bot token configured')
        return false
    }

    try {
        const response = await fetch(`${API_BASE}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                photo: photoUrl,
                caption: caption || '',
                parse_mode: 'HTML'
            })
        })

        const data: TelegramResponse = await response.json()

        if (!data.ok) {
            console.error('[Telegram Bot] Photo send failed:', data.description)
            return false
        }

        return true
    } catch (error) {
        console.error('[Telegram Bot] Error sending photo:', error)
        return false
    }
}

