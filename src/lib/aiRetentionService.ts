/**
 * AI Retention Service
 * 
 * Generates personalized retention messages using OpenAI.
 * Includes return probability estimation and A/B variant selection.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

interface UserContext {
    firstName: string | null
    inactiveDays: number
    lastActivityType: string | null
    segment: string
    engagementScore: number
    totalSessions: number
    totalWatchTime: number
    hasPurchases: boolean
    subscriptionActive: boolean
    language: string
}

interface StepConfig {
    tone: string
    goal: string
    basePrompt: string | null
}

/**
 * Generate a personalized retention message using OpenAI.
 */
export async function generateRetentionMessage(
    user: UserContext,
    step: StepConfig
): Promise<string> {
    if (!OPENAI_API_KEY) {
        console.warn('[AI Retention] No OpenAI API key configured, using fallback')
        return getFallbackMessage(user, step)
    }

    const toneMap: Record<string, string> = {
        soft: 'gentle, caring, and understanding',
        motivational: 'energetic, inspiring, and encouraging',
        strict: 'direct, urgent, and professional',
        friendly: 'warm, casual, and personal like a friend',
    }

    const goalMap: Record<string, string> = {
        return: 'encourage the user to return and continue their yoga practice',
        resubscribe: 'motivate the user to renew their subscription',
        purchase: 'guide the user toward making their first purchase',
    }

    const langInstruction = user.language === 'ru'
        ? 'Write in Russian.'
        : 'Write in Uzbek.'

    const systemPrompt = `You are a wellness retention specialist for "Baxtli Men" yoga platform. 
You craft personal, emotional Telegram messages that feel genuine, not spammy.
${langInstruction}
Max 500 characters. Use emojis naturally. No links or buttons.`

    const userPrompt = step.basePrompt || `
User name: ${user.firstName || 'Дорогой пользователь'}
Inactive days: ${user.inactiveDays}
Last activity: ${user.lastActivityType || 'unknown'}
Segment: ${user.segment}
Engagement score: ${user.engagementScore}
Total sessions: ${user.totalSessions}
Watch time: ${Math.round(user.totalWatchTime / 60)} minutes
Has purchases: ${user.hasPurchases}
Active subscription: ${user.subscriptionActive}

Tone: ${toneMap[step.tone] || toneMap.friendly}
Goal: ${goalMap[step.goal] || goalMap.return}

Generate a short, personal Telegram message.
Make it feel like it's from Sabina, the yoga instructor.
`

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 300,
                temperature: 0.8,
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            console.error('[AI Retention] OpenAI error:', err)
            return getFallbackMessage(user, step)
        }

        const data = await response.json()
        const text = data?.choices?.[0]?.message?.content?.trim()

        if (!text) return getFallbackMessage(user, step)
        return text
    } catch (error) {
        console.error('[AI Retention] Error generating message:', error)
        return getFallbackMessage(user, step)
    }
}

/**
 * Estimate return probability using AI.
 */
export async function estimateReturnProbability(user: UserContext): Promise<number> {
    if (!OPENAI_API_KEY) {
        return heuristicReturnProbability(user)
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a data analyst. Given user behavior data, estimate the probability of return as a number 0-100. Respond with ONLY a number.',
                    },
                    {
                        role: 'user',
                        content: `
Inactive days: ${user.inactiveDays}
Segment: ${user.segment}
Score: ${user.engagementScore}
Sessions: ${user.totalSessions}
Watch time: ${Math.round(user.totalWatchTime / 60)} min
Has purchases: ${user.hasPurchases}
Active sub: ${user.subscriptionActive}

Estimate probability of return (0-100):`,
                    },
                ],
                max_tokens: 10,
                temperature: 0.3,
            }),
        })

        if (!response.ok) return heuristicReturnProbability(user)

        const data = await response.json()
        const text = data?.choices?.[0]?.message?.content?.trim()
        const prob = parseInt(text || '50')
        return isNaN(prob) ? 50 : Math.min(100, Math.max(0, prob))
    } catch {
        return heuristicReturnProbability(user)
    }
}

/**
 * Adjust tone based on return probability.
 */
export function adjustToneByProbability(baseTone: string, probability: number): string {
    if (probability < 20) return 'motivational'  // Strong push for unlikely returns
    if (probability > 70) return 'soft'           // Gentle nudge for likely returns
    return baseTone                                // Keep original tone
}

/**
 * Select A/B variant for a user.
 */
export function selectVariant(userId: string): 'A' | 'B' {
    // Deterministic based on userId hash for consistency
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return hash % 2 === 0 ? 'A' : 'B'
}

/**
 * Preview an AI-generated message (for admin UI).
 */
export async function previewAiMessage(
    tone: string,
    goal: string,
    basePrompt: string | null
): Promise<string> {
    const mockUser: UserContext = {
        firstName: 'Alisher',
        inactiveDays: 5,
        lastActivityType: 'lesson_view',
        segment: 'warm',
        engagementScore: 35,
        totalSessions: 12,
        totalWatchTime: 3600,
        hasPurchases: false,
        subscriptionActive: false,
        language: 'uz',
    }

    return generateRetentionMessage(mockUser, { tone, goal, basePrompt })
}

// ── FALLBACK MESSAGES ──

function getFallbackMessage(user: UserContext, step: StepConfig): string {
    const name = user.firstName || ''
    const isUz = user.language !== 'ru'

    const templates: Record<string, Record<string, string>> = {
        return: {
            uz: `${name}, sog'lom turmush sizni kutmoqda! 🧘‍♀️ Qaytib keling va o'zingizga e'tibor bering.`,
            ru: `${name}, здоровый образ жизни ждёт вас! 🧘‍♀️ Вернитесь и позаботьтесь о себе.`,
        },
        resubscribe: {
            uz: `${name}, obunangiz tugadi, lekin yoga davom etadi! 💚 Yangi mashg'ulotlar sizni kutmoqda.`,
            ru: `${name}, подписка закончилась, но йога продолжается! 💚 Новые занятия ждут вас.`,
        },
        purchase: {
            uz: `${name}, 🌿 "Baxtli Men" kurslari sizga kuch va tinchlik beradi. Sinab ko'ring!`,
            ru: `${name}, 🌿 Курсы "Baxtli Men" дадут вам силу и покой. Попробуйте!`,
        },
    }

    const goalTemplates = templates[step.goal] || templates.return
    return isUz ? goalTemplates.uz : goalTemplates.ru
}

function heuristicReturnProbability(user: UserContext): number {
    let prob = 50

    // Adjust based on engagement
    if (user.engagementScore > 50) prob += 20
    else if (user.engagementScore < 20) prob -= 20

    // Adjust based on inactivity
    if (user.inactiveDays > 14) prob -= 15
    else if (user.inactiveDays < 3) prob += 15

    // Adjust based on purchases
    if (user.hasPurchases) prob += 10

    return Math.min(100, Math.max(0, prob))
}
