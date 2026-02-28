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

/**
 * Try to resolve a Telegram username to a numeric chat_id
 * Works only if the user has previously interacted with the bot
 */
export async function resolveTelegramChatId(username: string): Promise<string | null> {
    if (!BOT_TOKEN || !username) return null

    // Remove @ prefix if present
    const cleanUsername = username.replace('@', '')

    try {
        const response = await fetch(`${API_BASE}/getChat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: `@${cleanUsername}` })
        })

        const data = await response.json()

        if (data.ok && data.result?.id) {
            return String(data.result.id)
        }

        return null
    } catch (error) {
        console.error('[Telegram Bot] Error resolving username:', error)
        return null
    }
}

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
 * Helper: Generate a temporary public signed URL from GCS for Telegram to fetch
 * For non-GCS URLs, Telegram will fetch directly if public, otherwise this method will fail.
 */
async function uploadMediaToTelegram(
    method: string,
    chatId: string | number,
    mediaUrl: string,
    mediaField: string,
    caption?: string
): Promise<boolean> {
    if (!BOT_TOKEN) {
        console.error('[Telegram Bot] No bot token configured')
        return false
    }

    try {
        let telegramMediaUrl = mediaUrl

        // If it's a GCS URL, generate a signed URL that Telegram can access
        if (mediaUrl.includes('storage.googleapis.com')) {
            try {
                const { storage } = await import('@/lib/gcs/config')
                const bucketName = process.env.GCS_BUCKET_NAME || 'antigravity-videos-aziza'

                // Extract file path from GCS URL
                // URL format: https://storage.googleapis.com/BUCKET/PATH
                const urlObj = new URL(mediaUrl)
                let filePath = urlObj.pathname
                // Remove leading /BUCKET/ from path
                if (filePath.startsWith(`/${bucketName}/`)) {
                    filePath = filePath.substring(`/${bucketName}/`.length)
                } else if (filePath.startsWith('/')) {
                    filePath = filePath.substring(1)
                }
                filePath = decodeURIComponent(filePath)

                const bucket = storage.bucket(bucketName)
                const file = bucket.file(filePath)

                // Check if file exists
                const [exists] = await file.exists()
                if (!exists) {
                    console.error(`[Telegram Bot] File does not exist in GCS: ${filePath}`)
                    return false
                }

                // Get file metadata to check size
                const [metadata] = await file.getMetadata()
                const fileSizeMB = Math.round(Number(metadata.size) / 1024 / 1024)
                console.log(`[Telegram Bot] File: ${filePath}, size: ${fileSizeMB}MB`)

                const [signedUrl] = await file.getSignedUrl({
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 60 * 60 * 1000, // 1 hour
                })

                telegramMediaUrl = signedUrl
                console.log(`[Telegram Bot] Signed URL generated, length: ${signedUrl.length} chars`)

                // Telegram Bot API can only fetch files up to ~20MB by URL
                // For larger files, send as a text message with a clickable link
                if (fileSizeMB > 20) {
                    console.log(`[Telegram Bot] File is ${fileSizeMB}MB (>20MB limit), sending as link message`)
                    const emoji = mediaField === 'video' ? '🎥' : mediaField === 'audio' ? '🎵' : '📎'
                    const label = mediaField === 'video' ? 'Videoni ko\'rish' : mediaField === 'audio' ? 'Audioni tinglash' : 'Faylni yuklab olish'
                    let linkMessage = `${emoji} <b>${label}</b>\n\n`
                    if (caption) linkMessage += `${caption}\n\n`
                    linkMessage += `👉 <a href="${telegramMediaUrl}">Ochish / Ko'rish</a>`

                    return sendTelegramMessage(chatId, linkMessage)
                }
            } catch (gcsError) {
                console.error('[Telegram Bot] Failed to generate signed URL:', gcsError)
                return false
            }
        }

        // Send via URL for small files (Telegram fetches from the signed URL)
        const requestBody: any = {
            chat_id: chatId,
            [mediaField]: telegramMediaUrl,
            parse_mode: 'HTML'
        }
        if (caption) requestBody.caption = caption

        console.log(`[Telegram Bot] Sending ${method} to chat ${chatId}, file is small enough for direct send`)

        const response = await fetch(`${API_BASE}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        })

        const data: TelegramResponse = await response.json()

        if (!data.ok) {
            console.error(`[Telegram Bot] ${method} failed:`, data.description)
            return false
        }

        return true
    } catch (error) {
        console.error(`[Telegram Bot] Error in ${method}:`, error)
        return false
    }
}

/**
 * Send a video to a Telegram user
 */
export async function sendTelegramVideo(
    chatId: string | number,
    videoUrl: string,
    caption?: string
): Promise<boolean> {
    return uploadMediaToTelegram('sendVideo', chatId, videoUrl, 'video', caption)
}

/**
 * Send an audio file to a Telegram user
 */
export async function sendTelegramAudio(
    chatId: string | number,
    audioUrl: string,
    caption?: string
): Promise<boolean> {
    return uploadMediaToTelegram('sendAudio', chatId, audioUrl, 'audio', caption)
}

/**
 * Send a photo to a Telegram user
 */
export async function sendTelegramPhoto(
    chatId: string | number,
    photoUrl: string,
    caption?: string
): Promise<boolean> {
    return uploadMediaToTelegram('sendPhoto', chatId, photoUrl, 'photo', caption)
}

