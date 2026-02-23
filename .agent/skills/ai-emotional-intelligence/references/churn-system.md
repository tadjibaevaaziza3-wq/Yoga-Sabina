# Churn Prediction & Anti-Churn System

## Risk Score Calculation

Score 0-100 based on weighted factors:

| Factor | Weight | Measurement |
|---|---|---|
| Activity drop | 25 | Compare last 7d vs previous 7d watch time |
| Missed workouts | 20 | Days since last session |
| Watch time decline | 15 | % decrease in weekly minutes |
| Chat engagement drop | 10 | Messages last 7d vs previous 7d |
| Subscription expiring | 15 | Days until expiration |
| Negative emotional tone | 10 | Recent emotional state trend |
| Login gap | 5 | Days since last login |

## Risk Levels

```
0-25   → LOW
26-50  → MEDIUM
51-75  → HIGH
76-100 → CRITICAL
```

## Scoring Logic

```typescript
interface ChurnFactors {
    watchTimeThisWeek: number      // minutes
    watchTimeLastWeek: number
    daysSinceLastSession: number
    chatMessagesThisWeek: number
    chatMessagesLastWeek: number
    subscriptionDaysLeft: number
    emotionalStates: EmotionalState[]  // last 5
    daysSinceLastLogin: number
}

function calculateChurnScore(factors: ChurnFactors): number {
    let score = 0

    // Activity drop (0-25)
    if (factors.watchTimeLastWeek > 0) {
        const dropPct = 1 - (factors.watchTimeThisWeek / factors.watchTimeLastWeek)
        score += Math.min(25, Math.max(0, dropPct * 50))
    }

    // Missed workouts (0-20)
    score += Math.min(20, factors.daysSinceLastSession * 3)

    // Watch time decline (0-15)
    if (factors.watchTimeThisWeek < 10) score += 15
    else if (factors.watchTimeThisWeek < 30) score += 8

    // Chat engagement (0-10)
    if (factors.chatMessagesLastWeek > 0 && factors.chatMessagesThisWeek === 0) score += 10
    else if (factors.chatMessagesThisWeek < factors.chatMessagesLastWeek * 0.5) score += 5

    // Subscription expiring (0-15)
    if (factors.subscriptionDaysLeft < 3) score += 15
    else if (factors.subscriptionDaysLeft < 7) score += 10
    else if (factors.subscriptionDaysLeft < 14) score += 5

    // Negative emotions (0-10)
    const negativeStates = ['frustrated', 'doubting', 'overwhelmed']
    const negativeCount = factors.emotionalStates.filter(s => negativeStates.includes(s)).length
    score += Math.min(10, negativeCount * 3)

    // Login gap (0-5)
    score += Math.min(5, factors.daysSinceLastLogin)

    return Math.min(100, score)
}
```

## Anti-Churn Response Strategies

### LOW (0-25)
AI injects at end of normal response:
```
"Consistency matters more than intensity. Your practice is building something powerful 🌱"
```

### MEDIUM (26-50)
AI adds personalized reconnect:
```
"I noticed you haven't practiced in [X] days. Your last session showed real progress in [area].
Here's a quick 10-minute session that builds on what you've already achieved → [suggestion]"
```

Also: highlight achievements, show progress stats.

### HIGH (51-75)
AI sends emotional reconnect:
```
"[Name], I want you to know that every journey has rest days. You've already [achievement].
I have a special gentle session that many come back to when life gets busy → [easy content]"
```

Also: suggest easier programs, show streak recovery potential.

### CRITICAL (76-100)
AI activates full retention:
```
"[Name], your wellness journey matters to us. You've invested [X days] in yourself.
As a special gesture, here's an exclusive session just for you → [bonus content]
Your trainer Sabina has prepared something specifically for moments like these."
```

Also: alert admin dashboard, trigger reactivation notification.

## Admin Alert API

When churn level reaches HIGH or CRITICAL, create an alert:

```typescript
await prisma.adminActionLog.create({
    data: {
        adminId: 'SYSTEM',
        action: 'CHURN_ALERT',
        entity: 'User',
        entityId: userId,
        details: { churnScore, level, factors }
    }
})
```
