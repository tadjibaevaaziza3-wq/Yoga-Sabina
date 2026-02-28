/**
 * RAG Engine v3 — Concierge-Grade Knowledge Retrieval
 * 
 * Embedding-based search + Gemini response generation.
 * Subscription-aware response depth.
 * Persona-driven Sabina coaching style.
 * Admin/trainer contact fallback.
 */

import { Locale } from "./faq-engine"
import { geminiFlashModel } from "./gemini"
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"
import path from "path"

// ─── Types ───

interface KnowledgeBaseEntry {
    title: string
    summary: string
    topics: string[]
    transcript: string
    embedding?: number[]
}

interface SearchResult {
    title: string
    text: string
    score: number
}

interface QueryOptions {
    isSubscribed?: boolean
    userName?: string | null
    conversationHistory?: { role: string, content: string }[]
    gender?: string | null
    age?: number | null
    healthIssues?: string | null
    isPregnant?: boolean
    // Emotional Intelligence
    emotionalToneInstructions?: string
    userMemoryContext?: string
    // Subscription context
    subscribedCourseName?: string | null
}

// ─── State ───

let videoKB: Record<string, KnowledgeBaseEntry> = {}
let kbLoaded = false

const KB_PATH = path.join(process.cwd(), "src/lib/ai/knowledge-base/videos.json")

function loadKB() {
    if (kbLoaded) return
    try {
        const raw = fs.readFileSync(KB_PATH, "utf-8")
        videoKB = JSON.parse(raw)
        kbLoaded = true
        console.log(`[RAG] Loaded ${Object.keys(videoKB).length} KB entries`)
    } catch (e) {
        console.warn("[RAG] Failed to load KB:", e)
        videoKB = {}
        kbLoaded = true
    }
}

// ─── Embedding ───

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

async function getEmbedding(text: string): Promise<number[]> {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
        const result = await model.embedContent(text)
        return result.embedding.values
    } catch (e) {
        console.error("[RAG] Embedding failed:", e)
        return []
    }
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0
    let dotProduct = 0, normA = 0, normB = 0
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10)
}

// ─── Main Engine ───

export class RAGEngine {

    static async query(userQuery: string, lang: Locale, options: QueryOptions = {}): Promise<string> {
        loadKB()
        console.log(`[RAG] Query (${lang}): "${userQuery}"`)

        // 1. Semantic search with gender filtering
        let results = await this.semanticSearch(userQuery)

        // Filter results by gender awareness
        if (options.gender) {
            results = this.filterByGender(results, options.gender)
        }

        // 2. Fallback to keyword search
        if (results.length === 0) {
            let keywordResult = this.keywordSearch(userQuery)
            // Gender filter for keyword results too
            if (keywordResult && options.gender) {
                const filtered = this.filterByGender([keywordResult], options.gender)
                keywordResult = filtered.length > 0 ? filtered[0] : null
            }
            if (keywordResult) {
                return this.generateResponse(keywordResult, userQuery, lang, options)
            }
            // No KB match — use Gemini freeform intelligence
            return this.generateFreeformResponse(userQuery, lang, options)
        }

        // 3. Use best result
        return this.generateResponse(results[0], userQuery, lang, options)
    }

    /**
     * Filter RAG results to avoid recommending wrong-gender courses.
     * e.g. don't recommend men's yoga to a woman and vice versa.
     */
    private static filterByGender(results: SearchResult[], gender: string): SearchResult[] {
        const maleKeywords = ['erkaklar', 'мужчин', 'men\'s', 'prostatit', 'простатит']
        const femaleKeywords = ['ayollar', 'женщин', 'women\'s', 'hayz', 'менструал']

        return results.filter(r => {
            const titleLower = r.title.toLowerCase()
            const textLower = r.text.toLowerCase()
            const combined = titleLower + ' ' + textLower

            if (gender === 'female') {
                // Female user: exclude explicitly male courses
                if (maleKeywords.some(k => combined.includes(k))) return false
            } else if (gender === 'male') {
                // Male user: exclude explicitly female courses
                if (femaleKeywords.some(k => combined.includes(k))) return false
            }
            return true
        })
    }

    private static async semanticSearch(query: string): Promise<SearchResult[]> {
        const queryEmbedding = await getEmbedding(query)
        if (queryEmbedding.length === 0) return []

        const results: SearchResult[] = []

        for (const [id, entry] of Object.entries(videoKB)) {
            if (!entry.embedding || entry.embedding.length === 0) {
                const text = `${entry.title}. ${entry.summary}. ${entry.topics.join(", ")}`
                entry.embedding = await getEmbedding(text)
            }

            if (entry.embedding.length > 0) {
                const score = cosineSimilarity(queryEmbedding, entry.embedding)
                if (score > 0.5) {
                    results.push({ title: entry.title, text: entry.summary, score })
                }
            }
        }

        results.sort((a, b) => b.score - a.score)
        return results.slice(0, 3)
    }

    private static keywordSearch(query: string): SearchResult | null {
        const cleanQuery = query.toLowerCase().replace(/[.,!?;:]/g, '')
        const tokens = cleanQuery.split(/\s+/).filter(t => t.length > 2)
        let bestMatch: SearchResult | null = null
        let maxScore = 0

        for (const [id, entry] of Object.entries(videoKB)) {
            let score = 0
            if (tokens.some(t => entry.title.toLowerCase().includes(t))) score += 10
            entry.topics.forEach(topic => {
                if (tokens.some(t => topic.toLowerCase().includes(t) || t.includes(topic.toLowerCase()))) score += 5
            })
            if (tokens.some(t => entry.summary.toLowerCase().includes(t))) score += 3
            if (tokens.some(t => entry.transcript.toLowerCase().includes(t))) score += 1

            if (score > maxScore) {
                maxScore = score
                bestMatch = { title: entry.title, text: entry.summary, score }
            }
        }

        return maxScore > 0 ? bestMatch : null
    }

    /**
     * Generate a Gemini response in Sabina's persona with subscription-awareness.
     */
    private static async generateResponse(result: SearchResult, query: string, lang: Locale, options: QueryOptions): Promise<string> {
        try {
            const { isSubscribed = false, userName, conversationHistory = [], gender, age, healthIssues, isPregnant, emotionalToneInstructions, userMemoryContext } = options

            // Build conversation context
            const historyContext = conversationHistory.length > 0
                ? `\n\nPrevious conversation:\n${conversationHistory.map(m => `${m.role}: ${m.content.substring(0, 150)}`).join('\n')}`
                : ''

            const greeting = userName ? (lang === 'uz' ? `Foydalanuvchi ismi: ${userName}.` : `Имя пользователя: ${userName}.`) : ''

            // Build personalization context based on gender, age, health
            let personalizationContext = ''
            if (gender || age || healthIssues || isPregnant) {
                const parts: string[] = []
                if (gender) parts.push(lang === 'uz' ? `Jinsi: ${gender === 'male' ? 'erkak' : 'ayol'}` : `Пол: ${gender === 'male' ? 'мужчина' : 'женщина'}`)
                if (age) parts.push(lang === 'uz' ? `Yoshi: ${age}` : `Возраст: ${age}`)
                if (healthIssues) parts.push(lang === 'uz' ? `Sog'liq muammolari: ${healthIssues}` : `Проблемы со здоровьем: ${healthIssues}`)
                if (isPregnant) parts.push(lang === 'uz' ? 'Homilador' : 'Беременна')
                personalizationContext = `\n${lang === 'uz' ? 'Foydalanuvchi haqida' : 'О пользователе'}: ${parts.join(', ')}.\n${lang === 'uz' ? 'Maslahatlarni shu ma\'lumotlarga asoslanib shaxsiylshtir. Tegishli kursni tavsiya qil.' : 'Персонализируй советы на основе этих данных. Рекомендуй подходящий курс.'}`
            }

            // Emotional Intelligence context
            let emotionalContext = ''
            if (emotionalToneInstructions) {
                emotionalContext = `\n\n--- EMOTIONAL INTELLIGENCE ---\nAdapt your response tone based on the user's detected emotional state:\n${emotionalToneInstructions}\n\nResponse structure: (1) Emotional alignment, (2) Personalized insight, (3) Clear recommendation, (4) Gentle motivation, (5) Optional course suggestion.\n---`
            }

            // Behavior Memory context
            let memoryCtx = ''
            if (userMemoryContext) {
                memoryCtx = `\n${userMemoryContext}`
            }

            const subscriptionContext = isSubscribed
                ? (lang === 'uz'
                    ? `Foydalanuvchi obunachi${options.subscribedCourseName ? ` — "${options.subscribedCourseName}" kursiga obuna` : ''}. Batafsil, chuqur va shaxsiy maslahatlar ber. Video darslarga havola qil, mashqlarni qadamma-qadam tushuntir. MUHIM: Foydalanuvchi obuna bo'lgan kursga mos maslahat ber, boshqa jinsdagi kurslarni tavsiya QILMA.`
                    : `Пользователь — подписчик${options.subscribedCourseName ? ` курса "${options.subscribedCourseName}"` : ''}. Давай подробные, глубокие и персональные советы. Ссылайся на видеоуроки, объясняй упражнения пошагово. ВАЖНО: Рекомендуй контент из курса пользователя, НЕ рекомендуй курсы другого пола.`)
                : (lang === 'uz'
                    ? "Foydalanuvchi hali obuna emas. Foydali, lekin qisqa maslahat ber. Javob oxirida obuna bo'lishni va administrator (@Sabina_Radjapovna) bilan bog'lanishni tavsiya qil."
                    : "Пользователь ещё не подписан. Давай полезный, но краткий совет. В конце ответа рекомендуй подписаться и связаться с администратором (@Sabina_Radjapovna).")

            const persona = lang === 'uz'
                ? `Sen Sabina Polatova — 7+ yillik tajribali yoga terapevti va "Baxtli Men" platformasining asoschisi. Sen iliq, ishonchli, motivatsion va professional. Yoga, salomatlik, tana terapiyasi haqida maslahat berasan. ${greeting} ${subscriptionContext}${personalizationContext}${emotionalContext}${memoryCtx}`
                : `Ты — Сабина Полатова, опытный йога-терапевт с 7+ лет стажа и основатель платформы "Baxtli Men". Ты тёплая, уверенная, мотивирующая и профессиональная. Даёшь советы по йоге, здоровью, телесной терапии. ${greeting} ${subscriptionContext}${personalizationContext}${emotionalContext}${memoryCtx}`

            const prompt = `${persona}${historyContext}

${lang === 'uz' ? 'Foydalanuvchi savoli' : 'Вопрос пользователя'}: "${query}"

${lang === 'uz' ? "Ma'lumotlar bazasidan topilgan dars" : 'Найденный урок из базы знаний'}:
"${result.title}" — ${result.text}

${lang === 'uz'
                    ? `Qisqa va foydali javob ber (3-6 gap). Dars nomini ayt. Fakt to'qima. Javobni o'zbek tilida ber.`
                    : `Дай краткий полезный ответ (3-6 предложений). Упомяни название урока. Не выдумывай факты. Отвечай на русском.`}
${!isSubscribed ? (lang === 'uz' ? "\nJavob oxirida obuna yoki administrator bilan bog'lanishni tavsiya qil." : "\nВ конце рекомендуй подписаться или связаться с администратором.") : ''}`

            const response = await geminiFlashModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
            })

            return response.response.text().trim()
        } catch (e) {
            console.error("[RAG] Response generation failed:", e)
            return this.templateResponse(result, lang, options)
        }
    }

    private static templateResponse(data: SearchResult, lang: Locale, options: QueryOptions = {}): string {
        const ctaSuffix = !options.isSubscribed
            ? (lang === 'uz' ? "\n\n✨ Batafsil mashqlar uchun kurslarimizga obuna bo'ling! Administrator: @Sabina_Radjapovna" : "\n\n✨ Подпишитесь на курсы для детальных упражнений! Администратор: @Sabina_Radjapovna")
            : ""

        if (lang === 'uz') {
            return `🧘‍♂️ **Murabbiy Maslahati:**\n\nMen sizga mos darsni topdim: **"${data.title}"**.\n\n📄 **Mazmuni:** ${data.text}\n\nMashqni platformamizda ko'ring va bajaring! 🙏${ctaSuffix}`
        }
        return `🧘‍♂️ **Совет Тренера:**\n\nЯ нашла подходящий урок: **"${data.title}"**.\n\n📄 **Содержание:** ${data.text}\n\nРекомендую посмотреть и выполнить на нашей платформе! 🙏${ctaSuffix}`
    }

    /**
     * Generate a smart Gemini response even without a knowledge base match.
     * This is the key intelligence — the AI answers ANY question using Sabina's persona.
     */
    private static async generateFreeformResponse(query: string, lang: Locale, options: QueryOptions = {}): Promise<string> {
        try {
            const { isSubscribed = false, userName, conversationHistory = [], gender, age, healthIssues, isPregnant, emotionalToneInstructions, userMemoryContext } = options

            const historyContext = conversationHistory.length > 0
                ? `\n\nOldingi suhbat:\n${conversationHistory.map(m => `${m.role}: ${m.content.substring(0, 150)}`).join('\n')}`
                : ''

            const greeting = userName ? (lang === 'uz' ? `Foydalanuvchi ismi: ${userName}.` : `Имя пользователя: ${userName}.`) : ''

            let personalizationContext = ''
            if (gender || age || healthIssues || isPregnant) {
                const parts: string[] = []
                if (gender) parts.push(lang === 'uz' ? `Jinsi: ${gender === 'male' ? 'erkak' : 'ayol'}` : `Пол: ${gender === 'male' ? 'мужчина' : 'женщина'}`)
                if (age) parts.push(lang === 'uz' ? `Yoshi: ${age}` : `Возраст: ${age}`)
                if (healthIssues) parts.push(lang === 'uz' ? `Sog'liq muammolari: ${healthIssues}` : `Проблемы со здоровьем: ${healthIssues}`)
                if (isPregnant) parts.push(lang === 'uz' ? 'Homilador' : 'Беременна')
                personalizationContext = `\n${lang === 'uz' ? 'Foydalanuvchi haqida' : 'О пользователе'}: ${parts.join(', ')}.`
            }

            let emotionalContext = ''
            if (emotionalToneInstructions) {
                emotionalContext = `\n\n--- EMOTIONAL INTELLIGENCE ---\n${emotionalToneInstructions}\nResponse structure: (1) Emotional alignment, (2) Personalized insight, (3) Clear recommendation, (4) Gentle motivation, (5) Optional course suggestion.\n---`
            }

            let memoryCtx = ''
            if (userMemoryContext) {
                memoryCtx = `\n${userMemoryContext}`
            }

            const subscriptionCta = isSubscribed
                ? ''
                : (lang === 'uz'
                    ? "\nJavob oxirida tegishli bo'lsa kurslarimizni yoki @Sabina_Radjapovna bilan bog'lanishni tavsiya qil."
                    : "\nВ конце, если уместно, рекомендуй курсы или связаться с @Sabina_Radjapovna.")

            const prompt = `${lang === 'uz'
                ? `Sen Sabina Polatova — 7+ yillik tajribali yoga terapevti va "Baxtli Men" platformasining asoschisi. Sen iliq, ishonchli, motivatsion va professional. ${greeting}${personalizationContext}${emotionalContext}${memoryCtx}

Sen yoga, salomatlik, nafas mashqlari, meditatsiya, stress boshqarish, umumiy tana salomatligi, ovqatlanish, uyqu va hayot tarzi haqida maslahat bera olasan.

MUHIM QOIDALAR:
- Tibbiy tashxis QOYMA, lekin umumiy yoga va salomatlik maslahatlari ber
- Jiddiy muammolarda shifokorga murojaat qilishni maslahat ber
- Har doim foydali, aniq va amaliy javob ber
- Faqat "video topa olmadim" dema, DOIMO foydali javob ber
- Qisqa va tushunarli yoz (3-6 gap)${subscriptionCta}`
                : `Ты — Сабина Полатова, опытный йога-терапевт с 7+ лет стажа и основатель платформы "Baxtli Men". Ты тёплая, уверенная и профессиональная. ${greeting}${personalizationContext}${emotionalContext}${memoryCtx}

Ты можешь давать советы по йоге, здоровью, дыхательным практикам, медитации, управлению стрессом, общему здоровью тела, питанию, сну и образу жизни.

ВАЖНЫЕ ПРАВИЛА:
- НЕ ставь медицинские диагнозы, но давай общие советы по йоге и здоровью
- При серьёзных проблемах рекомендуй обратиться к врачу
- ВСЕГДА давай полезный, конкретный и практичный ответ
- НИКОГДА не говори "видео не найдено", ВСЕГДА давай полезный ответ
- Пиши кратко и понятно (3-6 предложений)${subscriptionCta}`
                }${historyContext}

${lang === 'uz' ? 'Foydalanuvchi savoli' : 'Вопрос пользователя'}: "${query}"

${lang === 'uz' ? 'Foydali, aniq va amaliy javob ber:' : 'Дай полезный, конкретный и практичный ответ:'}`

            const response = await geminiFlashModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
            })

            return response.response.text().trim()
        } catch (e) {
            console.error('[RAG] Freeform response generation failed:', e)
            // Ultimate fallback — static message only if Gemini itself fails
            return lang === 'uz'
                ? "Kechirasiz, hozir javob berishda muammo yuz berdi 🙏 Iltimos, qaytadan urinib ko'ring yoki Sabina murabbiy bilan bog'laning: @Sabina_Radjapovna"
                : "Извините, возникла проблема с ответом 🙏 Попробуйте ещё раз или свяжитесь с тренером Сабиной: @Sabina_Radjapovna"
        }
    }

    // ─── Admin Methods ───

    static async addEntry(id: string, entry: Omit<KnowledgeBaseEntry, 'embedding'>): Promise<void> {
        loadKB()
        const text = `${entry.title}. ${entry.summary}. ${entry.topics.join(", ")}`
        const embedding = await getEmbedding(text)
        videoKB[id] = { ...entry, embedding }
        this.persistKB()
        console.log(`[RAG] Added KB entry: ${id} (${entry.title})`)
    }

    static removeEntry(id: string): void {
        loadKB()
        delete videoKB[id]
        this.persistKB()
        console.log(`[RAG] Removed KB entry: ${id}`)
    }

    static listEntries(): { id: string, title: string, summary: string, topics: string[] }[] {
        loadKB()
        return Object.entries(videoKB).map(([id, entry]) => ({
            id, title: entry.title, summary: entry.summary, topics: entry.topics,
        }))
    }

    private static persistKB(): void {
        try {
            const toSave: Record<string, Omit<KnowledgeBaseEntry, 'embedding'>> = {}
            for (const [id, entry] of Object.entries(videoKB)) {
                toSave[id] = {
                    title: entry.title, summary: entry.summary,
                    topics: entry.topics, transcript: entry.transcript,
                }
            }
            fs.writeFileSync(KB_PATH, JSON.stringify(toSave, null, 2), "utf-8")
        } catch (e) {
            console.error("[RAG] Failed to persist KB:", e)
        }
    }
}
