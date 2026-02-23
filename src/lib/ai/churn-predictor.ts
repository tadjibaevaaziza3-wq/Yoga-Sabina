/**
 * Churn Prediction Engine
 * 
 * Calculates subscription cancellation risk based on
 * activity patterns, engagement, and emotional trends.
 */

import { EmotionalState } from './emotional-engine'

export type ChurnRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

interface ChurnFactors {
    watchTimeThisWeek: number      // minutes
    watchTimeLastWeek: number      // minutes
    daysSinceLastSession: number
    chatMessagesThisWeek: number
    chatMessagesLastWeek: number
    subscriptionDaysLeft: number
    emotionalStates: EmotionalState[]  // recent states
    daysSinceLastLogin: number
}

interface ChurnResult {
    score: number                  // 0-100
    level: ChurnRiskLevel
    factors: string[]              // human-readable risk factors
    antiChurnMessage?: string      // message to inject into response
}

export function calculateChurnRisk(factors: ChurnFactors, lang: 'uz' | 'ru' = 'uz'): ChurnResult {
    let score = 0
    const riskFactors: string[] = []

    // Activity drop (0-25)
    if (factors.watchTimeLastWeek > 0) {
        const dropPct = 1 - (factors.watchTimeThisWeek / factors.watchTimeLastWeek)
        const activityScore = Math.min(25, Math.max(0, Math.round(dropPct * 50)))
        score += activityScore
        if (activityScore > 10) riskFactors.push('Activity drop detected')
    } else if (factors.watchTimeThisWeek === 0) {
        score += 20
        riskFactors.push('No watch activity')
    }

    // Missed workouts (0-20)
    const missedScore = Math.min(20, factors.daysSinceLastSession * 3)
    score += missedScore
    if (factors.daysSinceLastSession >= 5) riskFactors.push(`${factors.daysSinceLastSession} days since last session`)

    // Watch time decline (0-15)
    if (factors.watchTimeThisWeek < 10) { score += 15; riskFactors.push('Very low watch time') }
    else if (factors.watchTimeThisWeek < 30) score += 8

    // Chat engagement (0-10)
    if (factors.chatMessagesLastWeek > 0 && factors.chatMessagesThisWeek === 0) {
        score += 10
        riskFactors.push('Chat engagement dropped to zero')
    } else if (factors.chatMessagesThisWeek < factors.chatMessagesLastWeek * 0.5) {
        score += 5
    }

    // Subscription expiring (0-15)
    if (factors.subscriptionDaysLeft < 3) { score += 15; riskFactors.push('Subscription expires in <3 days') }
    else if (factors.subscriptionDaysLeft < 7) { score += 10; riskFactors.push('Subscription expires this week') }
    else if (factors.subscriptionDaysLeft < 14) score += 5

    // Negative emotions (0-10)
    const negativeStates: EmotionalState[] = ['frustrated', 'doubting', 'overwhelmed']
    const negativeCount = factors.emotionalStates.filter(s => negativeStates.includes(s)).length
    const emotionScore = Math.min(10, negativeCount * 3)
    score += emotionScore
    if (negativeCount >= 2) riskFactors.push('Negative emotional trend')

    // Login gap (0-5)
    score += Math.min(5, factors.daysSinceLastLogin)

    score = Math.min(100, score)

    const level: ChurnRiskLevel = score <= 25 ? 'LOW'
        : score <= 50 ? 'MEDIUM'
            : score <= 75 ? 'HIGH'
                : 'CRITICAL'

    return {
        score,
        level,
        factors: riskFactors,
        antiChurnMessage: getAntiChurnMessage(level, lang, factors),
    }
}

// ─── Anti-Churn Response Messages ───

function getAntiChurnMessage(
    level: ChurnRiskLevel,
    lang: 'uz' | 'ru',
    factors: ChurnFactors
): string | undefined {
    if (level === 'LOW') return undefined // No intervention needed

    if (level === 'MEDIUM') {
        return lang === 'uz'
            ? `\n\n🌱 Sizning so'nggi mashg'ulotlaringiz haqiqatan ham ta'sirli edi. Muntazamlik — eng kuchli natija beruvchi omil. Bugun 10 daqiqalik yengil mashq qilsangiz — ajoyib boshlang'ich bo'ladi!`
            : `\n\n🌱 Ваши последние занятия были действительно впечатляющими. Регулярность — самый мощный фактор результата. Попробуйте 10-минутную лёгкую практику сегодня — отличное начало!`
    }

    if (level === 'HIGH') {
        return lang === 'uz'
            ? `\n\n🤗 Har bir yo'lda dam olish kunlari bo'ladi — bu tabiiy. Siz allaqachon katta yo'l bosib o'tdingiz. Bugun juda yengil va qisqa mashqdan boshlang — 5 daqiqa ham muhim!`
            : `\n\n🤗 В каждом пути бывают дни отдыха — это нормально. Вы уже прошли большой путь. Начните сегодня с очень лёгкой и короткой практики — даже 5 минут имеют значение!`
    }

    // CRITICAL
    return lang === 'uz'
        ? `\n\n💚 Sizning salomatligingiz biz uchun juda muhim. Siz ${factors.daysSinceLastSession} kun oldin mashq qilgan edingiz va har bir qaytish — g'alaba. Sabina murabbiy ayniqsa bunday paytlar uchun maxsus yengil dastur tayyorlagan. Bugun boshlab ko'ring? 🙏`
        : `\n\n💚 Ваше здоровье очень важно для нас. Вы занимались ${factors.daysSinceLastSession} дней назад, и каждое возвращение — это победа. Тренер Сабина подготовила специальную лёгкую программу именно для таких моментов. Начнём сегодня? 🙏`
}
