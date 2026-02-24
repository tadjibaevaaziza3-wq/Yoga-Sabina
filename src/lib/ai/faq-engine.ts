import { faqData } from "./faq-data"

export type Locale = "uz" | "ru"

export function findBestFAQMatch(query: string, lang: Locale) {
    const data = faqData[lang]
    const normalizedQuery = query.toLowerCase().replace(/[?.,!]/g, "")
    const queryWords = normalizedQuery.split(/\s+/)

    let bestMatch = null
    let maxScore = 0

    for (const item of data) {
        let score = 0

        // Count how many keywords from the FAQ item appear in the user's query
        for (const word of queryWords) {
            // Check for direct keyword matches
            if (item.keywords.some(k => word.includes(k) || k.includes(word))) {
                score += 1
            }
        }

        // Bonus for length matching (prevents tiny queries from hitting everything)
        if (score > 0) {
            if (score > maxScore) {
                maxScore = score
                bestMatch = item
            }
        }
    }

    // Threshold: require at least 2 keyword matches to avoid overly generic answers
    // (e.g. "yoga" alone should NOT trigger the generic "Yoga nima?" FAQ)
    if (maxScore >= 2 && bestMatch) {
        return bestMatch.answer
    }

    return null
}
