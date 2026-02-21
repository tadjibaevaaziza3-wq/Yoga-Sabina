import { Locale, findBestFAQMatch } from "./faq-engine"
import { faqData } from "./faq-data"
import { checkUserAccess } from "@/lib/db/access"
import { RAGEngine } from "./rag-engine"

export interface AIResponse {
    content: string
    role: 'assistant'
    metadata?: {
        isSafe: boolean
        requiresAccess: boolean
        topic: 'faq' | 'medical' | 'access' | 'general'
    }
}

// ─── Conversation Memory (per-user, last 20 messages) ───
const conversationMemory = new Map<string, { role: string, content: string }[]>()
const MAX_MEMORY = 20

function getMemory(userId: string): { role: string, content: string }[] {
    return conversationMemory.get(userId) || []
}

function addToMemory(userId: string, role: string, content: string) {
    const memory = getMemory(userId)
    memory.push({ role, content: content.substring(0, 500) }) // Truncate long messages
    if (memory.length > MAX_MEMORY) memory.shift()
    conversationMemory.set(userId, memory)
    // Cleanup old sessions (keep max 200 users in memory)
    if (conversationMemory.size > 200) {
        const firstKey = conversationMemory.keys().next().value
        if (firstKey) conversationMemory.delete(firstKey)
    }
}

export class MasterAgent {

    static async processRequest(query: string, lang: Locale, userId?: string, history: any[] = []): Promise<AIResponse> {
        const sessionId = userId || 'anonymous'

        // Store user message in memory
        addToMemory(sessionId, 'user', query)

        // 1. HISTORY INFERENCE (Context Awareness)
        let enrichedQuery = query
        const memory = getMemory(sessionId)
        const lastAssistantMsg = [...memory].reverse().find(m => m.role === 'assistant')

        const followUpKeywords = ['masalan', 'misol uchun', 'yana', 'batafsil', 'qanday', 'например', 'еще', 'подробнее', 'davom', 'продолж']
        if (query.toLowerCase().trim().split(/\s+/).length <= 3 && followUpKeywords.some(k => query.toLowerCase().includes(k))) {
            if (lastAssistantMsg) {
                enrichedQuery = `${lastAssistantMsg.content.substring(0, 200)} ${query}`
                console.log(`[AI] Enriched query with memory context`)
            }
        }

        // 2. CLASSIFICATION & SAFETY CHECK (Content Guard)
        const safetyCheck = this.contentGuard(enrichedQuery, lang)
        if (!safetyCheck.isSafe) {
            addToMemory(sessionId, 'assistant', safetyCheck.message)
            return {
                content: safetyCheck.message,
                role: 'assistant',
                metadata: { isSafe: false, requiresAccess: false, topic: 'medical' }
            }
        }

        // 3. INTENT RECOGNITION
        const lowerQuery = enrichedQuery.toLowerCase()
        const isPaidContentQuery = lowerQuery.includes('video') || lowerQuery.includes('kurs') || lowerQuery.includes('premium')

        // 4. ACCESS CONTROL
        if (isPaidContentQuery) {
            const hasAccess = await this.accessController(userId)
            if (!hasAccess) {
                const msg = this.videoProtectionAgent(lang)
                addToMemory(sessionId, 'assistant', msg)
                return {
                    content: msg,
                    role: 'assistant',
                    metadata: { isSafe: true, requiresAccess: true, topic: 'access' }
                }
            }
        }

        // 5. KNOWLEDGE RETRIEVAL (FAQ Responder)
        const faqAnswer = this.faqResponder(enrichedQuery, lang)
        if (faqAnswer) {
            addToMemory(sessionId, 'assistant', faqAnswer)
            return {
                content: faqAnswer,
                role: 'assistant',
                metadata: { isSafe: true, requiresAccess: false, topic: 'faq' }
            }
        }

        // 6. RAG ENGINE (Embedding-based Search + Gemini Response)
        const ragAnswer = await RAGEngine.query(enrichedQuery, lang)
        addToMemory(sessionId, 'assistant', ragAnswer)

        return {
            content: ragAnswer,
            role: 'assistant',
            metadata: { isSafe: true, requiresAccess: false, topic: 'general' }
        }
    }

    static async getPersonalizedRecommendation(symptoms: string | null, mood: number, lang: Locale): Promise<any> {
        // 1. Construct a query based on inputs
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

        // 2. Use RAG to find best match
        // We artificially boost the "instruction" part to get a specific lesson recommendation
        const enrichedQuery = `Tavsiya ber: ${query}. Qaysi dars yoki kursni maslahat berasan?`

        const ragResponse = await RAGEngine.query(enrichedQuery, lang)

        // 3. Extract/Parse recommendation (Mocking structured extraction for now)
        // In a real scenario, we'd ask LLM to return JSON. 
        // Here we just return the text and a generic 'daily_flow' link if no specific link found.

        return {
            text: ragResponse,
            // In future, extracting actual ID would be better
            type: 'general_advice'
        }
    }

    // --- SUB-AGENTS ---

    private static contentGuard(query: string, lang: Locale): { isSafe: boolean, message: string } {
        const backPainKeywords = ['bel', 'umurtqa', 'spine', 'back', 'позвоночник', 'спин', 'грыжа', 'gryja', 'hernia']
        const genericMedicalKeywords = [
            'kasal', 'davolash', 'shifokor', 'bol', 'pain', 'hurt', 'doctor', 'cure', 'боль', 'болит', 'лечить', 'врач',
            'cancer', 'treat', 'operation', 'jarrohlik', 'rak', 'operatsiya', 'shifo'
        ]
        const pregnancyKeywords = ['homilador', 'pregnant', 'беременн']
        const jointKeywords = ['tizza', 'bo\'g\'im', 'joint', 'knee', 'koleno', 'сустав', 'локоть', 'tirsak']
        const stressKeywords = ['stress', 'uyqusizlik', 'insomnia', 'charchoq', 'депрессия', 'бессонница', 'стресс', 'tired']

        const lowerQuery = query.toLowerCase()

        // 1. Specific helpful response for common yoga-related complaints (Back Pain)
        if (backPainKeywords.some(k => lowerQuery.includes(k))) {
            const msg = lang === 'uz'
                ? "Bel og'rig'i juda ko'p uchraydi, lekin tushkunlikka tushmang! ✨ Bizning 'Men's Yoga Standard' kursimizda umurtqa pog'onasini mustahkamlash uchun maxsus mashqlar bor. Iltimos, keskin harakatlardan qoching va mashqlarni Sabina ko'rsatganidek, nafasga asoslanib bajaring. (Eslatma: bu tibbiy maslahat emas, jiddiy og'riq bo'lsa shifokor bilan maslahatlashing)"
                : "Боль в спине — это частое явление, но не унывайте! ✨ В нашем курсе 'Men's Yoga Standard' есть специальные упражнения для укрепления позвоночника. Избегайте резких движений и выполняйте асаны плавно, следуя инструкциям Сабины. (Примечание: это не медицинский совет, при острой боли обратитесь к врачу)"
            return { isSafe: false, message: msg }
        }

        // 2. Joints Support
        if (jointKeywords.some(k => lowerQuery.includes(k))) {
            const msg = lang === 'uz'
                ? "Bo'g'imlardagi noqulaylikni tushunaman 🙏. Yoga orqali ularni yumshoq harakatlar bilan qizdirish va mustahkamlash mumkin. Mashqlarni juda ehtiyotkorlik bilan, og'riq sezmasdan bajaring. Kurslarimizdagi 'Artikulyar gimnastika' bo'limi sizga juda mos keladi!"
                : "Я понимаю ваш дискомфорт в суставах 🙏. С помощью йоги можно мягко разогреть и укрепить их. Выполняйте упражнения очень осторожно, не допуская боли. Вам отлично подойдет раздел 'Суставная гимнастика' в наших курсах!"
            return { isSafe: false, message: msg }
        }

        // 3. Stress/Insomnia Support
        if (stressKeywords.some(k => lowerQuery.includes(k))) {
            const msg = lang === 'uz'
                ? "Stress va charchoq hissi? ✨ Yoga va nafas mashqlari (Pranayama) asab tizimini tinchlantirishga yordam beradi. 'Kechki tinchlantiruvchi yoga' darsimizni sinab ko'ring — bu chuqur uyqu va xotirjamlikka erishishning eng yaxshi yo'li."
                : "Чувствуете стресс или усталость? ✨ Йога и дыхательные практики (Пранаяма) отлично помогают успокоить нервную систему. Попробуйте наш урок 'Вечерняя расслабляющая йога' — это лучший путь к глубокому сну и спокойствию."
            return { isSafe: false, message: msg }
        }

        // 4. Generic medical safety for everything else
        if (genericMedicalKeywords.some(k => lowerQuery.includes(k))) {
            const msg = lang === 'uz'
                ? "Uzr, men tibbiy maslahat bera olmayman 🙏. Agar sizda o'tkir og'riq yoki jarohat bo'lsa, iltimos, shifokor bilan maslahatlashing. Yengil mashqlar orqali tiklanish uchun kurslarimizni ko'rib chiqishingiz mumkin."
                : "Извините, я не могу давать медицинские советы 🙏. Если у вас острая боль или травма, пожалуйста, проконсультируйтесь с врачом. Вы можете ознакомиться с нашими курсами для мягкого восстановления через практику."
            return { isSafe: false, message: msg }
        }

        if (pregnancyKeywords.some(k => lowerQuery.includes(k))) {
            const msg = lang === 'uz'
                ? "Tabriklaymik! 🤰 Homiladorlik davrida mashq qilishdan oldin shifokoringiz bilan maslahatlashing. Bizda homiladorlar uchun xavfsiz mashqlar ham bor!"
                : "Поздравляю! 🤰 Перед началом занятий во время беременности, пожалуйста, проконсультируйтесь с врачом. У нас есть практики, адаптированные для этого периода!"
            return { isSafe: false, message: msg }
        }

        return { isSafe: true, message: "" }
    }

    private static async accessController(userId?: string): Promise<boolean> {
        if (!userId) return false

        // Real DB call
        return await checkUserAccess(userId)
    }

    private static videoProtectionAgent(lang: Locale): string {
        return lang === 'uz'
            ? "Ushbu kontent bizning premium kurslarimizga kiradi. 🧘‍♂️ Barcha darslarni ko'rish va murabbiy bilan ishlash uchun ro'yxatdan o'tishingizni yoki obunani faollashtirishingizni tavsiya qilaman! Men sizga bepul darslarni ham tavsiya qilishim mumkin."
            : "Этот контент входит в наши премиум-курсы. 🧘‍♂️ Для доступа ко всем урокам и работы с тренером рекомендую зарегистрироваться или активировать подписку! Я также могу предложить вам бесплатные ознакомительные уроки."
    }

    private static faqResponder(query: string, lang: Locale): string | null {
        // Reuse existing FAQ logic but wrapped
        return findBestFAQMatch(query, lang)
    }
}
