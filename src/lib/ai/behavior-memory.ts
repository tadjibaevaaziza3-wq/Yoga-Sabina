/**
 * Behavior Memory System
 * 
 * Per-user memory for goals, pain points, emotional history,
 * preferred times, favorite content, and complaints.
 * Persisted in Profile.behaviorMemory JSON field.
 */

import { prisma } from '@/lib/prisma'
import { EmotionalState } from './emotional-engine'

export interface UserBehaviorMemory {
    goals: string[]
    painPoints: string[]
    emotionalHistory: Array<{ state: EmotionalState; ts: string }>
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night' | null
    favoriteTopics: string[]
    complaints: string[]
    lastMentioned: string[]          // recent topics
    updatedAt: string
}

const EMPTY_MEMORY: UserBehaviorMemory = {
    goals: [],
    painPoints: [],
    emotionalHistory: [],
    preferredTime: null,
    favoriteTopics: [],
    complaints: [],
    lastMentioned: [],
    updatedAt: new Date().toISOString(),
}

// ─── Goal Extraction Keywords ───

const GOAL_PATTERNS = [
    /xohlayman|istardim|maqsadim|erishmoqchiman/i,      // UZ
    /хочу|хотела бы|моя цель|стремлюсь/i,                // RU
    /i want to|my goal|trying to|hoping to/i,             // EN
]

const PAIN_POINT_PATTERNS = [
    /og['']ri[gq]|muammo|qiynalyapman|bezovtalanadi/i,  // UZ
    /боль|проблема|мучает|беспокоит/i,                    // RU
    /pain|problem|hurts|struggling/i,                      // EN
]

const COMPLAINT_PATTERNS = [
    /yoqmadi|ishlamayapti|yomon|buzilgan/i,               // UZ
    /не нравится|не работает|плохо|сломал/i,               // RU
    /don['']t like|broken|bad|doesn['']t work/i,           // EN
]

// ─── Load/Save ───

export async function loadBehaviorMemory(userId: string): Promise<UserBehaviorMemory> {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId },
            select: { achievements: true } // Using achievements JSON field as memory store
        })
        if (profile?.achievements && typeof profile.achievements === 'object') {
            const raw = profile.achievements as any
            if (raw._behaviorMemory) return raw._behaviorMemory as UserBehaviorMemory
        }
    } catch { /* ignore */ }
    return { ...EMPTY_MEMORY }
}

export async function saveBehaviorMemory(userId: string, memory: UserBehaviorMemory): Promise<void> {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId },
            select: { achievements: true }
        })
        const existing = (profile?.achievements && typeof profile.achievements === 'object')
            ? profile.achievements as any
            : {}

        await prisma.profile.upsert({
            where: { userId },
            update: {
                achievements: { ...existing, _behaviorMemory: { ...memory, updatedAt: new Date().toISOString() } }
            },
            create: {
                userId,
                achievements: { _behaviorMemory: { ...memory, updatedAt: new Date().toISOString() } }
            }
        })
    } catch (e) {
        console.warn('[AI Memory] Failed to save:', e)
    }
}

// ─── Memory Extraction from Message ───

export function extractMemoryUpdates(
    message: string,
    currentMemory: UserBehaviorMemory,
    emotionalState: EmotionalState
): UserBehaviorMemory {
    const updated = { ...currentMemory }

    // Extract goals
    if (GOAL_PATTERNS.some(p => p.test(message))) {
        const condensed = message.substring(0, 100).trim()
        if (!updated.goals.includes(condensed)) {
            updated.goals = [...updated.goals.slice(-4), condensed] // Keep last 5
        }
    }

    // Extract pain points
    if (PAIN_POINT_PATTERNS.some(p => p.test(message))) {
        const condensed = message.substring(0, 80).trim()
        if (!updated.painPoints.includes(condensed)) {
            updated.painPoints = [...updated.painPoints.slice(-4), condensed]
        }
    }

    // Extract complaints
    if (COMPLAINT_PATTERNS.some(p => p.test(message))) {
        const condensed = message.substring(0, 80).trim()
        if (!updated.complaints.includes(condensed)) {
            updated.complaints = [...updated.complaints.slice(-4), condensed]
        }
    }

    // Track emotional history (keep last 10)
    updated.emotionalHistory = [
        ...updated.emotionalHistory.slice(-9),
        { state: emotionalState, ts: new Date().toISOString() }
    ]

    // Update timestamp
    updated.updatedAt = new Date().toISOString()

    return updated
}

// ─── Memory Context for System Prompt ───

export function getMemoryContext(memory: UserBehaviorMemory): string {
    const parts: string[] = []

    if (memory.goals.length > 0) {
        parts.push(`User goals: ${memory.goals.slice(-3).join('; ')}`)
    }
    if (memory.painPoints.length > 0) {
        parts.push(`Known pain points: ${memory.painPoints.slice(-3).join('; ')}`)
    }
    if (memory.complaints.length > 0) {
        parts.push(`Previous concerns: ${memory.complaints.slice(-2).join('; ')}`)
    }
    if (memory.preferredTime) {
        parts.push(`Preferred practice time: ${memory.preferredTime}`)
    }
    if (memory.favoriteTopics.length > 0) {
        parts.push(`Favorite topics: ${memory.favoriteTopics.join(', ')}`)
    }

    // Emotional trend
    if (memory.emotionalHistory.length >= 3) {
        const recent = memory.emotionalHistory.slice(-3).map(e => e.state)
        parts.push(`Recent emotional trend: ${recent.join(' → ')}`)
    }

    return parts.length > 0
        ? `\n--- User Memory ---\n${parts.join('\n')}\n---`
        : ''
}
