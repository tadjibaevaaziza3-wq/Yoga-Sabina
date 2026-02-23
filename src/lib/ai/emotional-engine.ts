/**
 * Emotional Intelligence Engine
 * 
 * Detects user's emotional state from messages, behavior patterns, and KPI data.
 * Returns tone modifiers for the AI response system.
 */

export type EmotionalState = 'motivated' | 'tired' | 'frustrated' | 'insecure' | 'doubting' | 'overwhelmed' | 'confident'

interface EmotionalSignals {
    message: string
    recentMessages: string[]       // last 5 user messages
    activityGapDays: number        // days since last session
    moodKpi?: number               // 1-5 from CheckIn
    hourOfDay: number              // 0-23
    streakDays: number
    subscriptionDaysLeft?: number
}

interface EmotionalResult {
    state: EmotionalState
    confidence: number             // 0-1
    toneInstructions: string       // system prompt injection
}

// ─── Keyword Banks ───

const TIRED_KEYWORDS = [
    'charchadim', 'holsizman', 'vaqtim yo\'q', 'qiyin', 'uxlolmayapman', 'toliqtim', 'qiynalyapman',
    'устала', 'устал', 'нет сил', 'тяжело', 'не могу', 'не высыпаюсь', 'утомил', 'выдохлась',
    'tired', 'exhausted', 'no energy', 'can\'t sleep'
]

const FRUSTRATED_KEYWORDS = [
    'ishlamayapti', 'nima uchun', 'yana', 'tushunmayapman', 'bezildim', 'juda qiyin',
    'не работает', 'почему', 'опять', 'не понимаю', 'надоело', 'бесит', 'раздражает',
    'not working', 'frustrated', 'annoying', 'again'
]

const INSECURE_KEYWORDS = [
    'to\'g\'rimi', 'qila olamanmi', 'qo\'rqaman', 'bilmayaman', 'xato qilayapmanmi',
    'правильно ли', 'смогу ли', 'боюсь', 'не знаю', 'я не уверена', 'не получается',
    'am i doing it right', 'scared', 'not sure'
]

const DOUBTING_KEYWORDS = [
    'qimmat', 'kerakmi', 'bekor qilish', 'foydasi bormi', 'pulim yo\'q', 'o\'ylab ko\'raman',
    'дорого', 'нужно ли', 'отменить', 'есть ли смысл', 'подумаю', 'не уверена стоит ли',
    'too expensive', 'cancel', 'worth it', 'waste of money'
]

const OVERWHELMED_KEYWORDS = [
    'juda ko\'p', 'qaysinisini', 'chalg\'itadi', 'boshim qotdi', 'tushunmayapman nimadan boshlash',
    'слишком много', 'не знаю с чего начать', 'запуталась', 'голова кругом',
    'too much', 'confused', 'don\'t know where to start'
]

const MOTIVATED_KEYWORDS = [
    'tayyorman', 'boshlaymiz', 'ajoyib', 'davom etaman', 'yangi mashq', 'kuchliroq',
    'готова', 'готов', 'начнём', 'отлично', 'продолжаю', 'хочу больше', 'вперед',
    'ready', 'let\'s go', 'amazing', 'more', 'challenge'
]

const CONFIDENT_KEYWORDS = [
    'bajardim', 'uddaladim', 'o\'sish sezayapman', 'yaxshi ketayapti', 'raxmat',
    'получилось', 'справилась', 'чувствую прогресс', 'всё хорошо', 'спасибо',
    'did it', 'feeling great', 'progress', 'thank you'
]

// ─── Detection ───

function matchKeywords(text: string, keywords: string[]): number {
    const lower = text.toLowerCase()
    const matches = keywords.filter(k => lower.includes(k)).length
    return Math.min(1, matches / 2) // Normalize to 0-1, 2+ matches = full score
}

export function detectEmotionalState(signals: EmotionalSignals): EmotionalResult {
    const { message, recentMessages, activityGapDays, moodKpi, hourOfDay, streakDays, subscriptionDaysLeft } = signals

    // Combine recent text for pattern analysis
    const allText = [message, ...recentMessages].join(' ')
    const messageWords = message.trim().split(/\s+/).length

    // Score each state
    const scores: Record<EmotionalState, number> = {
        motivated: 0,
        tired: 0,
        frustrated: 0,
        insecure: 0,
        doubting: 0,
        overwhelmed: 0,
        confident: 0,
    }

    // Keyword matching (primary signal)
    scores.tired += matchKeywords(allText, TIRED_KEYWORDS) * 40
    scores.frustrated += matchKeywords(allText, FRUSTRATED_KEYWORDS) * 40
    scores.insecure += matchKeywords(allText, INSECURE_KEYWORDS) * 40
    scores.doubting += matchKeywords(allText, DOUBTING_KEYWORDS) * 40
    scores.overwhelmed += matchKeywords(allText, OVERWHELMED_KEYWORDS) * 40
    scores.motivated += matchKeywords(allText, MOTIVATED_KEYWORDS) * 40
    scores.confident += matchKeywords(allText, CONFIDENT_KEYWORDS) * 40

    // Activity gap (secondary signal)
    if (activityGapDays >= 7) scores.tired += 15
    if (activityGapDays >= 14) scores.frustrated += 10
    if (activityGapDays >= 3 && activityGapDays < 7) scores.tired += 8

    // Streak bonus
    if (streakDays >= 7) scores.motivated += 10
    if (streakDays >= 14) scores.confident += 15

    // Mood KPI
    if (moodKpi !== undefined) {
        if (moodKpi <= 2) { scores.tired += 15; scores.frustrated += 10 }
        else if (moodKpi <= 3) { scores.tired += 8 }
        else if (moodKpi >= 4) { scores.motivated += 10 }
        else if (moodKpi >= 5) { scores.confident += 15 }
    }

    // Time of day
    if (hourOfDay >= 23 || hourOfDay <= 4) scores.tired += 8 // Late night = likely tired/stressed

    // Short messages = possible frustration/boredom
    if (messageWords <= 2 && recentMessages.length > 2) scores.frustrated += 5

    // Subscription expiring = potential doubt
    if (subscriptionDaysLeft !== undefined && subscriptionDaysLeft < 7) scores.doubting += 10

    // Repetition detection (same question = frustration)
    if (recentMessages.length >= 2) {
        const lastTwo = recentMessages.slice(-2).map(m => m.toLowerCase().trim())
        if (lastTwo[0] === lastTwo[1]) scores.frustrated += 15
    }

    // Determine winning state
    const entries = Object.entries(scores) as [EmotionalState, number][]
    entries.sort((a, b) => b[1] - a[1])
    const [topState, topScore] = entries[0]

    // Default to 'confident' if no strong signals
    if (topScore < 10) {
        return {
            state: 'confident',
            confidence: 0.3,
            toneInstructions: getToneInstructions('confident'),
        }
    }

    return {
        state: topState,
        confidence: Math.min(1, topScore / 50),
        toneInstructions: getToneInstructions(topState),
    }
}

// ─── Tone Instructions (injected into system prompt) ───

function getToneInstructions(state: EmotionalState): string {
    const instructions: Record<EmotionalState, string> = {
        motivated: `User is highly motivated. Match their energy with performance challenges. 
Suggest advanced content. Celebrate their consistency. Use energetic language.
Example opening: "Your dedication is inspiring!"`,

        tired: `User appears tired or low-energy. Use soft, gentle encouragement.
Suggest short sessions (5-15 min). Validate that rest is part of the journey.
Avoid pressure. Example opening: "I understand you need something gentle today."`,

        frustrated: `User seems frustrated. Be calming and patient.
Simplify your explanation. Break things into small steps.
Acknowledge difficulty. Example opening: "I hear you — let's simplify this."`,

        insecure: `User lacks confidence. Reinforce their progress with specific evidence.
Highlight small wins. Use reassuring language. Never add pressure.
Example opening: "You're doing better than you think."`,

        doubting: `User is questioning their subscription value. Show concrete benefits.
Highlight what they've achieved. Remind what they'd lose access to.
Never be pushy — be matter-of-fact about value. Example: "Here's what you've gained so far..."`,

        overwhelmed: `User feels overwhelmed. Narrow options to ONE clear step.
Don't list many choices. Guide them to the single best next action.
Example opening: "Let's focus on just one thing right now."`,

        confident: `User is in a great state. Celebrate wins naturally.
Suggest next challenges. Build momentum. Keep it premium and warm.`
    }
    return instructions[state]
}
