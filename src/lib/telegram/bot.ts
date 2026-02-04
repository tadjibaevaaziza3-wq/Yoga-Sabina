import { Telegraf, Markup } from 'telegraf'

const token = process.env.TELEGRAM_BOT_TOKEN
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baxtli-men.uz'

if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined')
}

export const bot = new Telegraf(token)

bot.start((ctx) => {
    const name = ctx.from.first_name
    const welcomeMessage = `
Salom, ${name}! 👋 
**Baxtli Men** platformasiga xush kelibsiz.

Men sizga yoga va salomatlik dunyosida yordam beraman. 🧘‍♀️✨

Kurslarni ko'rish va shug'ullanishni boshlash uchun quyidagi tugmani bosing:
`

    const welcomeMessageRu = `
Привет, ${name}! 👋
Добро пожаловать на платформу **Baxtli Men**.

Я помогу вам в мире йоги и здоровья. 🧘‍♀️✨

Нажмите кнопку ниже, чтобы посмотреть курсы и начать заниматься:
`

    ctx.reply(welcomeMessage, Markup.inlineKeyboard([
        [Markup.button.webApp('Ilovani ochish / Открыть приложение', `${appUrl}/tma`)]
    ]))
})

// Webhook setup might be needed for production
// For local dev, we could use polling but Next.js prefers webhooks in serverless context

export async function sendBroadcast(telegramId: string, type: 'TEXT' | 'PHOTO' | 'VIDEO' | 'AUDIO', content: string, mediaUrl?: string) {
    try {
        switch (type) {
            case 'TEXT':
                await bot.telegram.sendMessage(telegramId, content, { parse_mode: 'Markdown' })
                break
            case 'PHOTO':
                if (mediaUrl) await bot.telegram.sendPhoto(telegramId, mediaUrl, { caption: content, parse_mode: 'Markdown' })
                break
            case 'VIDEO':
                if (mediaUrl) await bot.telegram.sendVideo(telegramId, mediaUrl, { caption: content, parse_mode: 'Markdown' })
                break
            case 'AUDIO':
                if (mediaUrl) await bot.telegram.sendAudio(telegramId, mediaUrl, { caption: content, parse_mode: 'Markdown' })
                break
        }
        return { success: true }
    } catch (error: any) {
        console.error(`Broadcast failed for ${telegramId}:`, error.message)
        return { success: false, error: error.message }
    }
}
