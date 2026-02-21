/**
 * Auto-Translation Module
 * 
 * Uses Gemini Flash for fast, high-quality uz↔ru translation.
 * Integrated into admin course/lesson creation routes so content
 * is automatically available in both languages.
 */

import { geminiFlashModel } from "@/lib/ai/gemini"

// Simple in-memory cache to avoid redundant API calls
const translationCache = new Map<string, string>()

function cacheKey(text: string, from: string, to: string): string {
    return `${from}:${to}:${text.substring(0, 100)}`
}

/**
 * Translate text between Uzbek and Russian using Gemini Flash.
 * Returns the original text if translation fails (graceful degradation).
 */
export async function translateText(
    text: string,
    from: 'uz' | 'ru',
    to: 'uz' | 'ru'
): Promise<string> {
    if (!text || text.trim().length === 0) return text
    if (from === to) return text

    // Check cache first
    const key = cacheKey(text, from, to)
    if (translationCache.has(key)) {
        return translationCache.get(key)!
    }

    const fromLang = from === 'uz' ? "O'zbek tili (lotin)" : "Русский язык"
    const toLang = to === 'uz' ? "O'zbek tili (lotin)" : "Русский язык"

    try {
        const result = await geminiFlashModel.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: `Translate the following text from ${fromLang} to ${toLang}. 
Return ONLY the translated text, no explanations, no quotes, no markdown.
Keep the same tone and style. Preserve any HTML tags or formatting.

Text to translate:
${text}`
                }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
            }
        })

        const translated = result.response.text().trim()

        // Cache the result
        translationCache.set(key, translated)

        // Keep cache size reasonable
        if (translationCache.size > 500) {
            const firstKey = translationCache.keys().next().value
            if (firstKey) translationCache.delete(firstKey)
        }

        return translated
    } catch (error) {
        console.error(`Translation failed (${from} → ${to}):`, error)
        return text // Graceful fallback: return original
    }
}

/**
 * Translate an array of strings (e.g., features list).
 * Returns original array if translation fails.
 */
export async function translateArray(
    items: string[],
    from: 'uz' | 'ru',
    to: 'uz' | 'ru'
): Promise<string[]> {
    if (!items || items.length === 0) return items

    try {
        const results = await Promise.all(
            items.map(item => translateText(item, from, to))
        )
        return results
    } catch {
        return items
    }
}

/**
 * Auto-fill missing translations for a course/lesson data object.
 * Detects which language was provided and fills the other.
 * 
 * @param data - Object with potential *Ru fields
 * @param fields - Array of field name pairs [base, ruVariant]
 */
export async function autoTranslateFields(
    data: Record<string, any>,
    fields: [string, string][] = [
        ['title', 'titleRu'],
        ['description', 'descriptionRu'],
        ['location', 'locationRu'],
        ['schedule', 'scheduleRu'],
        ['times', 'timesRu'],
    ]
): Promise<Record<string, any>> {
    const result = { ...data }

    for (const [uzField, ruField] of fields) {
        const uzValue = data[uzField]
        const ruValue = data[ruField]

        // If uz provided but ru missing → translate uz→ru
        if (uzValue && !ruValue) {
            result[ruField] = await translateText(uzValue, 'uz', 'ru')
        }
        // If ru provided but uz missing → translate ru→uz
        else if (ruValue && !uzValue) {
            result[uzField] = await translateText(ruValue, 'ru', 'uz')
        }
    }

    // Handle features arrays
    if (data.features && !data.featuresRu) {
        result.featuresRu = await translateArray(data.features, 'uz', 'ru')
    } else if (data.featuresRu && !data.features) {
        result.features = await translateArray(data.featuresRu, 'ru', 'uz')
    }

    return result
}
