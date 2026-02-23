/**
 * Auto-Translation Module
 * 
 * Uses Google Translate for fast uz↔ru translation.
 * Falls back to Gemini Flash if GEMINI_API_KEY is configured.
 * Integrated into admin course/lesson creation routes so content
 * is automatically available in both languages.
 */

// Simple in-memory cache to avoid redundant API calls
const translationCache = new Map<string, string>()

function cacheKey(text: string, from: string, to: string): string {
    return `${from}:${to}:${text.substring(0, 100)}`
}

/**
 * Translate text using Google Translate (free tier).
 */
async function googleTranslate(text: string, from: string, to: string): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`

    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
        }
    })

    if (!res.ok) {
        throw new Error(`Google Translate HTTP ${res.status}`)
    }

    const data = await res.json()

    // Response format: [[["translated text","original text",null,null,1]], ...]
    if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((segment: any) => segment?.[0] || '').join('')
    }

    throw new Error('Unexpected Google Translate response format')
}

/**
 * Translate text using Gemini Flash (if API key is available).
 */
async function geminiTranslate(text: string, from: string, to: string): Promise<string> {
    try {
        const { geminiFlashModel } = await import("@/lib/ai/gemini")

        const fromLang = from === 'uz' ? "O'zbek tili (lotin)" : "Русский язык"
        const toLang = to === 'uz' ? "O'zbek tili (lotin)" : "Русский язык"

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

        return result.response.text().trim()
    } catch (error) {
        console.warn('Gemini translation failed, falling back to Google Translate:', error)
        throw error
    }
}

/**
 * Translate text between Uzbek and Russian.
 * Strategy: Try Google Translate first (fast, no API key needed).
 * Falls back to Gemini if Google fails and GEMINI_API_KEY is set.
 * Returns the original text if all methods fail (graceful degradation).
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

    try {
        // Primary: Google Translate (free, fast, no API key)
        const translated = await googleTranslate(text, from, to)

        // Cache the result
        translationCache.set(key, translated)
        if (translationCache.size > 500) {
            const firstKey = translationCache.keys().next().value
            if (firstKey) translationCache.delete(firstKey)
        }

        return translated
    } catch (error) {
        console.warn('Google Translate failed:', error)
    }

    // Fallback: Gemini (requires GEMINI_API_KEY)
    if (process.env.GEMINI_API_KEY) {
        try {
            const translated = await geminiTranslate(text, from, to)
            translationCache.set(key, translated)
            return translated
        } catch (error) {
            console.error(`Gemini translation also failed (${from} → ${to}):`, error)
        }
    }

    // Final fallback: return original text
    console.error(`All translation methods failed (${from} → ${to})`)
    return text
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
