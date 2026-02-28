import { Locale, findBestFAQMatch } from "./faq-engine"
import { faqData } from "./faq-data"
import { checkUserAccess } from "@/lib/db/access"
import { RAGEngine } from "./rag-engine"
import { prisma } from "@/lib/prisma"
import { detectEmotionalState, EmotionalState } from "./emotional-engine"
import { calculateChurnRisk, ChurnRiskLevel } from "./churn-predictor"
import { loadBehaviorMemory, saveBehaviorMemory, extractMemoryUpdates, getMemoryContext } from "./behavior-memory"
import { detectSalesOpportunity, generateSalesResponse } from "./sales-intelligence"

export interface AIResponse {
    content: string
    role: 'assistant'
    metadata?: {
        isSafe: boolean
        requiresAccess: boolean
        topic: 'faq' | 'medical' | 'access' | 'general' | 'sales'
        suggestContact?: boolean
    }
}

export interface UserContext {
    userId?: string
    firstName?: string
    isSubscribed: boolean
    healthIssues?: string | null
    gender?: string | null      // 'male', 'female'
    age?: number | null
    isPregnant?: boolean
    lang: Locale
    // ─── Emotional Intelligence Fields ───
    lastActivityDaysAgo?: number
    watchTimeThisWeek?: number     // minutes
    watchTimeLastWeek?: number     // minutes
    streakDays?: number
    subscriptionDaysLeft?: number
    chatMessagesThisWeek?: number
    chatMessagesLastWeek?: number
    lastMoodKpi?: number           // 1-5 from CheckIn
    daysSinceLastLogin?: number
    // Subscription context
    subscribedCourseName?: string | null
}

// ─── Persistent Conversation Memory ───

async function loadHistory(userId?: string, sessionId?: string): Promise<{ role: string, content: string }[]> {
    try {
        const where = userId
            ? { userId }
            : sessionId
                ? { sessionId }
                : null
        if (!where) return []

        const rows = await prisma.aiConversation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { role: true, content: true }
        })
        return rows.reverse() // oldest first
    } catch (e) {
        console.warn('[AI] Failed to load history:', e)
        return []
    }
}

async function saveMessage(params: {
    userId?: string
    sessionId: string
    role: string
    content: string
    topic?: string
    metadata?: any
}) {
    try {
        await prisma.aiConversation.create({
            data: {
                userId: params.userId || null,
                sessionId: params.sessionId,
                role: params.role,
                content: params.content.substring(0, 2000),
                topic: params.topic,
                metadata: params.metadata || undefined,
            }
        })
    } catch (e) {
        console.warn('[AI] Failed to save message:', e)
    }
}

export class MasterAgent {

    static async processRequest(
        query: string,
        lang: Locale,
        userCtx: UserContext,
        clientHistory: any[] = []
    ): Promise<AIResponse> {
        const sessionId = userCtx.userId || `anon-${Date.now()}`

        // 1. LOAD PERSISTENT MEMORY
        const memory = await loadHistory(userCtx.userId, sessionId)

        // Save user message
        await saveMessage({
            userId: userCtx.userId,
            sessionId,
            role: 'user',
            content: query,
        })

        // 1b. EMOTIONAL INTELLIGENCE — detect state before anything else
        const recentUserMsgs = memory.filter(m => m.role === 'user').map(m => m.content).slice(-5)
        const emotionalResult = detectEmotionalState({
            message: query,
            recentMessages: recentUserMsgs,
            activityGapDays: userCtx.lastActivityDaysAgo || 0,
            moodKpi: userCtx.lastMoodKpi,
            hourOfDay: new Date().getHours(),
            streakDays: userCtx.streakDays || 0,
            subscriptionDaysLeft: userCtx.subscriptionDaysLeft,
        })
        console.log(`[AI] Emotional state: ${emotionalResult.state} (${Math.round(emotionalResult.confidence * 100)}%)`)

        // 1c. BEHAVIOR MEMORY — load per-user memory
        let behaviorMemory = userCtx.userId
            ? await loadBehaviorMemory(userCtx.userId)
            : null

        // 1d. CHURN PREDICTION — assess risk for subscribers
        let churnResult = null
        if (userCtx.isSubscribed && userCtx.userId) {
            const recentEmotions = behaviorMemory?.emotionalHistory
                ?.slice(-5)
                .map(e => e.state) || []
            churnResult = calculateChurnRisk({
                watchTimeThisWeek: userCtx.watchTimeThisWeek || 0,
                watchTimeLastWeek: userCtx.watchTimeLastWeek || 0,
                daysSinceLastSession: userCtx.lastActivityDaysAgo || 0,
                chatMessagesThisWeek: userCtx.chatMessagesThisWeek || 0,
                chatMessagesLastWeek: userCtx.chatMessagesLastWeek || 0,
                subscriptionDaysLeft: userCtx.subscriptionDaysLeft || 999,
                emotionalStates: recentEmotions,
                daysSinceLastLogin: userCtx.daysSinceLastLogin || 0,
            }, lang)
            if (churnResult.level !== 'LOW') {
                console.log(`[AI] Churn risk: ${churnResult.level} (score: ${churnResult.score})`)
            }
        }

        // 2. CONTEXT ENRICHMENT (follow-up detection)
        let enrichedQuery = query
        const lastAssistantMsg = [...memory].reverse().find(m => m.role === 'assistant')

        const followUpKeywords = ['masalan', 'misol uchun', 'yana', 'batafsil', 'qanday', 'например', 'еще', 'подробнее', 'davom', 'продолж', 'ko\'proq', 'подробн']
        if (query.toLowerCase().trim().split(/\s+/).length <= 4 && followUpKeywords.some(k => query.toLowerCase().includes(k))) {
            if (lastAssistantMsg) {
                enrichedQuery = `${lastAssistantMsg.content.substring(0, 300)} — ${query}`
                console.log(`[AI] Enriched query with memory context`)
            }
        }

        // 3. CONTENT GUARD (Safety)
        const safetyCheck = this.contentGuard(enrichedQuery, lang, userCtx.isSubscribed, userCtx.gender, userCtx.subscribedCourseName)
        if (!safetyCheck.isSafe) {
            const msg = this.applyEmotionalTone(safetyCheck.message, emotionalResult.state, lang)
            await saveMessage({ userId: userCtx.userId, sessionId, role: 'assistant', content: msg, topic: 'medical' })
            if (behaviorMemory && userCtx.userId) {
                behaviorMemory = extractMemoryUpdates(query, behaviorMemory, emotionalResult.state)
                await saveBehaviorMemory(userCtx.userId, behaviorMemory)
            }
            return { content: msg, role: 'assistant', metadata: { isSafe: false, requiresAccess: false, topic: 'medical' } }
        }

        // 3b. PREGNANCY GUARD
        // Only block exercise-related queries when user is pregnant
        // Allow course inquiry questions ("kurs bormi?", "homiladorlar kursi")
        if (userCtx.isPregnant) {
            const exerciseKeywords = ['mashq', 'exercise', 'trenirovka', 'упражн', 'тренир', 'asana']
            const courseInquiryKeywords = ['kurs', 'bormi', 'qaysi', 'курс', 'есть ли', 'mavjud']
            const lowerEnriched = enrichedQuery.toLowerCase()
            const isExerciseQuery = exerciseKeywords.some(k => lowerEnriched.includes(k))
            const isCourseInquiry = courseInquiryKeywords.some(k => lowerEnriched.includes(k))
            // Only block if asking about exercises, NOT about course availability
            if (isExerciseQuery && !isCourseInquiry) {
                const msg = lang === 'uz'
                    ? "Siz homiladorlik davrida ekansiz 🤰 Iltimos, har qanday mashqlarni boshlashdan avval shifokoringiz bilan maslahatlashing. Sabina murabbiy homiladorlar uchun xavfsiz dastur yaratib beradi — @Sabina_Radjapovna ga yozing!"
                    : "Вы в период беременности 🤰 Перед началом любых упражнений обязательно проконсультируйтесь с врачом. Тренер Сабина может составить безопасную программу — напишите @Sabina_Radjapovna!"
                await saveMessage({ userId: userCtx.userId, sessionId, role: 'assistant', content: msg, topic: 'medical' })
                return { content: msg, role: 'assistant', metadata: { isSafe: false, requiresAccess: false, topic: 'medical' } }
            }
        }

        // 4. INTENT RECOGNITION
        const lowerQuery = enrichedQuery.toLowerCase()
        const isPaidContentQuery = lowerQuery.includes('video') || lowerQuery.includes('kurs') || lowerQuery.includes('premium') || lowerQuery.includes('dars') || lowerQuery.includes('урок') || lowerQuery.includes('курс')
        const isSubscriptionQuery = lowerQuery.includes('obuna') || lowerQuery.includes('подписк') || lowerQuery.includes('narx') || lowerQuery.includes('цена') || lowerQuery.includes('qancha') || lowerQuery.includes('сколько стоит')
        const isContactQuery = lowerQuery.includes('aloqa') || lowerQuery.includes('связаться') || lowerQuery.includes('admin') || lowerQuery.includes('murabbiy') || lowerQuery.includes('тренер') || lowerQuery.includes('trainer')

        // 5. CONTACT REQUEST → Direct to admin
        if (isContactQuery) {
            const msg = this.contactResponse(lang)
            await saveMessage({ userId: userCtx.userId, sessionId, role: 'assistant', content: msg, topic: 'general' })
            return { content: msg, role: 'assistant', metadata: { isSafe: true, requiresAccess: false, topic: 'general', suggestContact: true } }
        }

        // 6. SALES INTELLIGENCE — enhanced subscription/purchase response
        if (!userCtx.isSubscribed) {
            const salesOpp = detectSalesOpportunity(query)
            if (isSubscriptionQuery || salesOpp) {
                const msg = generateSalesResponse({
                    message: query,
                    lang,
                    emotionalState: emotionalResult.state,
                    healthIssues: userCtx.healthIssues,
                    gender: userCtx.gender,
                    age: userCtx.age,
                })
                await saveMessage({ userId: userCtx.userId, sessionId, role: 'assistant', content: msg, topic: 'sales' })
                return { content: msg, role: 'assistant', metadata: { isSafe: true, requiresAccess: false, topic: 'sales' } }
            }
        }

        // 7. ACCESS CONTROL for paid content queries
        if (isPaidContentQuery && !userCtx.isSubscribed) {
            const msg = this.videoProtectionAgent(lang)
            await saveMessage({ userId: userCtx.userId, sessionId, role: 'assistant', content: msg, topic: 'access' })
            return { content: msg, role: 'assistant', metadata: { isSafe: true, requiresAccess: true, topic: 'access' } }
        }

        // 8. FAQ RESPONDER
        const faqAnswer = this.faqResponder(enrichedQuery, lang)
        if (faqAnswer) {
            let enhanced = userCtx.isSubscribed
                ? faqAnswer
                : `${faqAnswer}\n\n💡 ${lang === 'uz' ? "Batafsil video darslar va shaxsiy maslahatlar uchun kurslarimizga obuna bo'ling!" : "Для подробных видеоуроков и персональных рекомендаций подпишитесь на наши курсы!"}`
            // Inject anti-churn message if needed (rate-limited)
            if (churnResult?.antiChurnMessage) {
                const recentResponses = memory.filter(m => m.role === 'assistant').slice(-3)
                const alreadyHasChurnMsg = recentResponses.some(m =>
                    m.content.includes('🌱 Sizning') || m.content.includes('🤗 Har bir') ||
                    m.content.includes('💚 Sizning') || m.content.includes('🌱 Ваши') ||
                    m.content.includes('🤗 В каждом') || m.content.includes('💚 Ваше')
                )
                if (!alreadyHasChurnMsg) enhanced += churnResult.antiChurnMessage
            }
            await saveMessage({ userId: userCtx.userId, sessionId, role: 'assistant', content: enhanced, topic: 'faq' })
            if (behaviorMemory && userCtx.userId) {
                behaviorMemory = extractMemoryUpdates(query, behaviorMemory, emotionalResult.state)
                await saveBehaviorMemory(userCtx.userId, behaviorMemory)
            }
            return { content: enhanced, role: 'assistant', metadata: { isSafe: true, requiresAccess: false, topic: 'faq' } }
        }

        // 9. RAG ENGINE — with emotional intelligence + memory context
        const memoryContext = behaviorMemory ? getMemoryContext(behaviorMemory) : ''
        const ragAnswer = await RAGEngine.query(enrichedQuery, lang, {
            isSubscribed: userCtx.isSubscribed,
            userName: userCtx.firstName,
            conversationHistory: memory.slice(-6),
            gender: userCtx.gender,
            age: userCtx.age,
            healthIssues: userCtx.healthIssues,
            isPregnant: userCtx.isPregnant,
            // ─── Emotional Intelligence Injection ───
            emotionalToneInstructions: emotionalResult.toneInstructions,
            userMemoryContext: memoryContext,
            // ─── Subscription Context ───
            subscribedCourseName: userCtx.subscribedCourseName,
        })

        // Append anti-churn message ONLY if not already in recent messages (rate limit)
        let finalResponse = ragAnswer
        if (churnResult?.antiChurnMessage) {
            const recentResponses = memory.filter(m => m.role === 'assistant').slice(-3)
            const alreadyHasChurnMsg = recentResponses.some(m =>
                m.content.includes('🌱 Sizning') || m.content.includes('🤗 Har bir') ||
                m.content.includes('💚 Sizning') || m.content.includes('🌱 Ваши') ||
                m.content.includes('🤗 В каждом') || m.content.includes('💚 Ваше')
            )
            if (!alreadyHasChurnMsg) {
                finalResponse += churnResult.antiChurnMessage
            }
        }

        // Save response and update behavior memory
        await saveMessage({
            userId: userCtx.userId, sessionId, role: 'assistant', content: finalResponse, topic: 'general',
            metadata: { emotionalState: emotionalResult.state, churnLevel: churnResult?.level }
        })

        if (behaviorMemory && userCtx.userId) {
            behaviorMemory = extractMemoryUpdates(query, behaviorMemory, emotionalResult.state)
            await saveBehaviorMemory(userCtx.userId, behaviorMemory)
        }

        return {
            content: finalResponse,
            role: 'assistant',
            metadata: {
                isSafe: true,
                requiresAccess: false,
                topic: 'general',
                emotionalState: emotionalResult.state,
                churnLevel: churnResult?.level,
            } as any
        }
    }

    static async getPersonalizedRecommendation(symptoms: string | null, mood: number, lang: Locale): Promise<any> {
        let query = ""
        if (symptoms) {
            query += `Menda quyidagi muammolar bor: ${symptoms}. `
        }
        if (mood <= 3) {
            query += "Kayfiyatim juda yomon, tushkunlikdaman. Menga tinchlantiruvchi va qo'llab-quvvatlovchi narsa kerak. "
        } else if (mood <= 6) {
            query += "Kayfiyatim o'rtacha. Yengil va tetiklashtiruvchi mashqlar kerak. "
        } else {
            query += "Kayfiyatim a'lo! Kuchli va faol yoga mashqlarini xohlayman. "
        }

        const enrichedQuery = `Tavsiya ber: ${query}. Qaysi dars yoki kursni maslahat berasan?`
        const ragResponse = await RAGEngine.query(enrichedQuery, lang, { isSubscribed: true })

        return {
            text: ragResponse,
            type: 'general_advice'
        }
    }

    // ─── EMOTIONAL TONE ADAPTATION ───

    private static applyEmotionalTone(message: string, state: EmotionalState, lang: Locale): string {
        // Prepend an emotional alignment line based on detected state
        const openers: Partial<Record<EmotionalState, { uz: string; ru: string }>> = {
            tired: {
                uz: 'Tushunaman, bugun oson emas bo\'lishi mumkin. ',
                ru: 'Понимаю, сегодня может быть непросто. ',
            },
            frustrated: {
                uz: 'Sizni eshityapman, sabr qiling 🙏 ',
                ru: 'Я вас слышу, наберитесь терпения 🙏 ',
            },
            insecure: {
                uz: 'Siz to\'g\'ri yo\'ldasiz — davom eting! ',
                ru: 'Вы на правильном пути — продолжайте! ',
            },
            overwhelmed: {
                uz: 'Hamma narsa birdan bo\'lishi shart emas — bosqichma-bosqich. ',
                ru: 'Всё сразу не обязательно — шаг за шагом. ',
            },
        }

        const opener = openers[state]
        if (opener) {
            return opener[lang] + message
        }
        return message
    }

    // ─── SUB-AGENTS ───

    private static contentGuard(query: string, lang: Locale, isSubscribed: boolean, gender?: string | null, subscribedCourseName?: string | null): { isSafe: boolean, message: string } {
        // ONLY block truly dangerous medical topics that require a doctor
        // Common health questions (back pain, headaches, stress, joints) go to Gemini for smart answers
        const dangerousMedicalKeywords = [
            'cancer', 'rak', 'рак', 'operation', 'operatsiya', 'операция', 'jarrohlik',
            'surgery', 'хирургия', 'tumor', 'o\'sma', 'опухоль',
            'insulin', 'диабет', 'diabet', 'epilepsy', 'эпилепсия', 'epilepsiya',
            'infarkt', 'инфаркт', 'insult', 'инсульт'
        ]

        const lowerQuery = query.toLowerCase()

        // Only block serious medical queries that we absolutely should NOT answer
        if (dangerousMedicalKeywords.some(k => lowerQuery.includes(k))) {
            const msg = lang === 'uz'
                ? "Bu mavzu bo'yicha men maslahat bera olmayman 🙏 Iltimos, shifokoringiz bilan maslahatlashing. Yoga va salomatlik bo'yicha boshqa savollarga men doimo tayyorman! ✨"
                : "По этой теме я не могу давать советы 🙏 Пожалуйста, проконсультируйтесь с врачом. По вопросам йоги и здоровья я всегда готова помочь! ✨"
            return { isSafe: false, message: msg }
        }

        // Everything else is safe — let Gemini handle it intelligently
        return { isSafe: true, message: "" }
    }

    private static videoProtectionAgent(lang: Locale): string {
        return lang === 'uz'
            ? "Bu kontent bizning premium kurslarimizga kiradi 🧘‍♂️\n\nBarcha video darslarni ko'rish va murabbiy bilan shaxsiy mashg'ulot uchun obunani faollashtiring!\n\n📞 Administrator bilan bog'lanish: @Sabina_Radjapovna\n💰 Kurslar va narxlar: saytdagi 'Kurslar' bo'limida\n\nMen sizga bepul mavzularda ham maslahat berishim mumkin — so'rang! 🙏"
            : "Этот контент входит в наши премиум-курсы 🧘‍♂️\n\nДля доступа ко всем видеоурокам и персональных занятий с тренером активируйте подписку!\n\n📞 Связаться с администратором: @Sabina_Radjapovna\n💰 Курсы и цены: в разделе 'Курсы' на сайте\n\nЯ также могу помочь с бесплатными рекомендациями — спрашивайте! 🙏"
    }

    private static subscriptionSalesResponse(lang: Locale): string {
        return lang === 'uz'
            ? "Bizning kurslarimiz haqida so'rayapsizmi? 🌟\n\n🧘‍♂️ **Erkaklar uchun Yoga Terapiya** — umurtqa, gormonlar, prostatit\n🌸 **Baxtli Ayollar Klubi** — gormonal yoga, ayollik energiyasi\n💆 **Yuz Yogasi 3v1** — tabiiy yosharish\n🧘 **Stress va Xotirjamlik** — meditatsiya, uyqu\n\nHar bir kurs Sabina murabbiyning video darslari, shaxsiy mashqlar va 24/7 qo'llab-quvvatlashni o'z ichiga oladi.\n\n📞 Batafsil: @Sabina_Radjapovna ga yozing\n🛒 Yoki saytdagi 'Kurslar' bo'limiga kiring!"
            : "Интересуетесь нашими курсами? 🌟\n\n🧘‍♂️ **Йога-терапия для мужчин** — позвоночник, гормоны, простатит\n🌸 **Клуб счастливых женщин** — гормональная йога, женская энергия\n💆 **Фейс-йога 3в1** — натуральное омоложение\n🧘 **Стресс и спокойствие** — медитация, сон\n\nКаждый курс включает видеоуроки Сабины, персональные упражнения и поддержку 24/7.\n\n📞 Подробности: напишите @Sabina_Radjapovna\n🛒 Или перейдите в раздел 'Курсы' на сайте!"
    }

    private static contactResponse(lang: Locale): string {
        return lang === 'uz'
            ? "Murabbiy yoki administrator bilan bog'lanish uchun:\n\n📱 Telegram: @Sabina_Radjapovna\n📧 Sayt orqali: 'Aloqa' bo'limi\n\nSabina murabbiy barcha savollarga javob beradi va sizga mos mashqlar tanlashda yordam beradi! 🙏"
            : "Для связи с тренером или администратором:\n\n📱 Telegram: @Sabina_Radjapovna\n📧 Через сайт: раздел 'Контакты'\n\nТренер Сабина ответит на все вопросы и поможет подобрать подходящие упражнения! 🙏"
    }

    private static faqResponder(query: string, lang: Locale): string | null {
        return findBestFAQMatch(query, lang)
    }
}
