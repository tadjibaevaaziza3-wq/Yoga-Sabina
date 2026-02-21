/**
 * RAG Engine v2 — Gemini Embedding-Based Knowledge Retrieval
 * 
 * Replaces keyword search with cosine-similarity over Gemini embeddings.
 * Supports dynamic KB updates from admin (add video transcripts at runtime).
 * Falls back to keyword search if embedding fails.
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
    embedding?: number[]  // Cached embedding vector
}

interface SearchResult {
    title: string
    text: string
    score: number
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

    /**
     * Query the knowledge base using embedding similarity + keyword fallback.
     * Returns a Gemini-generated response in Sabina's persona.
     */
    static async query(userQuery: string, lang: Locale): Promise<string> {
        loadKB()
        console.log(`[RAG] Query (${lang}): "${userQuery}"`)

        // 1. Try embedding-based search
        const results = await this.semanticSearch(userQuery)

        // 2. Fallback to keyword search if no embedding results
        if (results.length === 0) {
            const keywordResult = this.keywordSearch(userQuery)
            if (keywordResult) {
                return this.generateResponse(keywordResult, userQuery, lang)
            }
            return this.noResultResponse(lang)
        }

        // 3. Use best result for response generation
        return this.generateResponse(results[0], userQuery, lang)
    }

    /**
     * Semantic search using Gemini embeddings.
     */
    private static async semanticSearch(query: string): Promise<SearchResult[]> {
        const queryEmbedding = await getEmbedding(query)
        if (queryEmbedding.length === 0) return []

        const results: SearchResult[] = []

        for (const [id, entry] of Object.entries(videoKB)) {
            // Get or compute embedding for this entry
            if (!entry.embedding || entry.embedding.length === 0) {
                const text = `${entry.title}. ${entry.summary}. ${entry.topics.join(", ")}`
                entry.embedding = await getEmbedding(text)
            }

            if (entry.embedding.length > 0) {
                const score = cosineSimilarity(queryEmbedding, entry.embedding)
                if (score > 0.5) { // Threshold for relevance
                    results.push({
                        title: entry.title,
                        text: entry.summary,
                        score
                    })
                }
            }
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score)
        return results.slice(0, 3) // Top 3 results
    }

    /**
     * Keyword-based search (fallback).
     */
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
     * Generate a natural response in Sabina's persona using Gemini.
     */
    private static async generateResponse(result: SearchResult, query: string, lang: Locale): Promise<string> {
        try {
            const persona = lang === 'uz'
                ? "Sen Sabina Polatova — tajribali yoga terapeuti. Javoblaringda iliq, ishonchli va motivatsion bo'l. Foydalanuvchi savoli va malumotga asoslanib javob ber."
                : "Ты — Сабина Полатова, опытный йога-терапевт. Отвечай тепло, уверенно и мотивирующе. Отвечай на основе вопроса пользователя и найденной информации."

            const prompt = `${persona}

Вопрос пользователя: "${query}"

Найденная информация из базы знаний:
Урок: "${result.title}"
Содержание: ${result.text}

Дай краткий, полезный ответ (3-5 предложений). Упомяни название урока. Не выдумывай факты.${lang === 'uz' ? " Javobni o'zbek tilida ber." : " Отвечай на русском языке."}`

            const response = await geminiFlashModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
            })

            return response.response.text().trim()
        } catch (e) {
            console.error("[RAG] Response generation failed:", e)
            // Fallback to template response
            return this.templateResponse(result, lang)
        }
    }

    private static templateResponse(data: SearchResult, lang: Locale): string {
        if (lang === 'uz') {
            return `🧘‍♂️ **Murabbiy Maslahati:**\n\nMen sizga mos darsni topdim: **"${data.title}"**.\n\n📄 **Mazmuni:** ${data.text}\n\nMashqni platformamizda ko'ring va bajaring! 🙏`
        }
        return `🧘‍♂️ **Совет Тренера:**\n\nЯ нашла подходящий урок: **"${data.title}"**.\n\n📄 **Содержание:** ${data.text}\n\nРекомендую посмотреть и выполнить на нашей платформе! 🙏`
    }

    private static noResultResponse(lang: Locale): string {
        return lang === 'uz'
            ? "Kechirasiz, darslarimiz orasidan bu savolga mos video topa olmadim. Iltimos, savolni boshqacharoq bering yoki murabbiyga murojaat qiling. 🙏"
            : "Извините, я не нашла подходящего видео среди наших уроков. Попробуйте перефразировать вопрос или обратитесь к тренеру. 🙏"
    }

    // ─── Admin Methods ───

    /**
     * Add a new entry to the knowledge base (called from admin API).
     */
    static async addEntry(id: string, entry: Omit<KnowledgeBaseEntry, 'embedding'>): Promise<void> {
        loadKB()

        // Generate embedding
        const text = `${entry.title}. ${entry.summary}. ${entry.topics.join(", ")}`
        const embedding = await getEmbedding(text)

        videoKB[id] = { ...entry, embedding }

        // Persist to disk
        this.persistKB()
        console.log(`[RAG] Added KB entry: ${id} (${entry.title})`)
    }

    /**
     * Remove an entry from the knowledge base.
     */
    static removeEntry(id: string): void {
        loadKB()
        delete videoKB[id]
        this.persistKB()
        console.log(`[RAG] Removed KB entry: ${id}`)
    }

    /**
     * List all KB entries (for admin UI).
     */
    static listEntries(): { id: string, title: string, summary: string, topics: string[] }[] {
        loadKB()
        return Object.entries(videoKB).map(([id, entry]) => ({
            id,
            title: entry.title,
            summary: entry.summary,
            topics: entry.topics,
        }))
    }

    private static persistKB(): void {
        try {
            // Strip embeddings before saving (recalculated on load)
            const toSave: Record<string, Omit<KnowledgeBaseEntry, 'embedding'>> = {}
            for (const [id, entry] of Object.entries(videoKB)) {
                toSave[id] = {
                    title: entry.title,
                    summary: entry.summary,
                    topics: entry.topics,
                    transcript: entry.transcript,
                }
            }
            fs.writeFileSync(KB_PATH, JSON.stringify(toSave, null, 2), "utf-8")
        } catch (e) {
            console.error("[RAG] Failed to persist KB:", e)
        }
    }
}
