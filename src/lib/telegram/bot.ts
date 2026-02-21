import { Telegraf, Markup } from 'telegraf'

// Initialize bot with token
const token = process.env.TELEGRAM_BOT_TOKEN
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baxtli-men.uz'

// Global bot instance
let bot: Telegraf | null = null

if (token) {
    bot = new Telegraf(token)

    // Handle /start command with optional deep linking payload
    bot.start((ctx) => {
        const name = ctx.from.first_name
        // @ts-ignore - telegraf types might be slightly off for startPayload depending on version
        const payload = ctx.payload || (ctx.message && 'text' in ctx.message ? ctx.message.text.split(' ')[1] : '')

        console.log(`[Bot] /start from ${ctx.from.id} with payload: ${payload || 'none'}`)

        // Construct Web App URL with start_param if payload exists
        // Telegram Web App reads this from initData.start_param
        const webAppUrl = payload ? `${appUrl}/tma?start_param=${payload}` : `${appUrl}/tma`

        const welcomeMessage = `
Salom, ${name}! 👋 
**Baxtli Men** platformasiga xush kelibsiz.

Men sizga yoga va salomatlik dunyosida yordam beraman. 🧘‍♀️✨

Kurslarni ko'rish va shug'ullanishni boshlash uchun quyidagi tugmani bosing:
`

        ctx.reply(welcomeMessage, Markup.inlineKeyboard([
            [Markup.button.webApp('Ilovani ochish / Открыть приложение', webAppUrl)]
        ]))
    })

    // Basic help command
    bot.help((ctx) => {
        ctx.reply('Yordam uchun administratorga bog\'laning: @baxtli_men_admin')
    })

    // Launch logic is handled by webhook or polling externally, 
    // but for now we export the instance for API usage.
}

export { bot }

/**
 * Sends a message to a specific Telegram user.
 * Handles text, photo, video, and action buttons.
 */
export async function sendTelegramMessage(
    telegramId: string,
    content: string,
    type: 'TEXT' | 'PHOTO' | 'VIDEO' | 'AUDIO' = 'TEXT',
    mediaUrl?: string,
    buttons?: any[]
) {
    if (!bot) {
        console.warn('Telegram bot not configured - skipping message')
        return { success: false, error: 'Bot not configured' }
    }

    try {
        const extra: any = { parse_mode: 'Markdown' }
        if (buttons && buttons.length > 0) {
            extra.reply_markup = { inline_keyboard: buttons }
        }

        switch (type) {
            case 'TEXT':
                await bot.telegram.sendMessage(telegramId, content, extra)
                break
            case 'PHOTO':
                if (mediaUrl) {
                    extra.caption = content
                    await bot.telegram.sendPhoto(telegramId, mediaUrl, extra)
                }
                break
            case 'VIDEO':
                if (mediaUrl) {
                    extra.caption = content
                    await bot.telegram.sendVideo(telegramId, mediaUrl, extra)
                }
                break
            case 'AUDIO':
                if (mediaUrl) {
                    extra.caption = content
                    await bot.telegram.sendAudio(telegramId, mediaUrl, extra)
                }
                break
        }
        return { success: true }
    } catch (error: any) {
        console.error(`Failed to send Telegram message to ${telegramId}:`, error.message)
        // Check for "blocked" error
        if (error.response && error.response.error_code === 403) {
            return { success: false, error: 'USER_BLOCKED', details: error.message }
        }
        return { success: false, error: error.message }
    }
}

/**
 * Broadcasts a message to multiple users or a channel (simplified for now).
 * In this implementation, it's a wrapper for sendTelegramMessage.
 */
export async function sendBroadcast(
    telegramId: string,
    type: 'TEXT' | 'PHOTO' | 'VIDEO' | 'AUDIO' = 'TEXT',
    content: string,
    mediaUrl?: string
) {
    return sendTelegramMessage(telegramId, content, type, mediaUrl);
}
