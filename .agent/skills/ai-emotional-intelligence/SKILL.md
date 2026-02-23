---
name: ai-emotional-intelligence
description: Upgrade the existing AI Concierge (MasterAgent) into an advanced Emotional + Predictive Intelligence System. Use when enhancing AI chat behavior, implementing emotional detection, churn prediction, anti-churn strategies, personalized health intelligence, sales intelligence for non-subscribers, behavior memory, or AI learning from content. Triggers on any AI upgrade work including emotional tone adaptation, predictive analytics, user behavior modeling, subscription retention, admin AI dashboard, or AI response quality improvement.
---

# AI Emotional + Predictive Intelligence Upgrade

Upgrade the existing `MasterAgent` in `src/lib/ai/master-agent.ts`. Do NOT rebuild backend — enhance the existing AI logic, behavior modeling, and response generation.

## Existing Architecture

```
src/lib/ai/
├── master-agent.ts      ← MasterAgent class (processRequest, contentGuard, faqResponder)
├── faq-engine.ts        ← FAQ matching
├── faq-data.ts          ← FAQ database
└── rag-engine.ts        ← RAG retrieval

src/app/api/ai/chat/route.ts  ← POST handler, builds UserContext, calls MasterAgent
src/components/AIAgent.tsx     ← Global floating chat UI
src/components/AIAgentWrapper.tsx ← Route-aware wrapper
```

### Current UserContext

```typescript
interface UserContext {
    userId?: string
    firstName?: string
    isSubscribed: boolean
    healthIssues?: string | null
    gender?: string | null
    age?: number | null
    isPregnant?: boolean
    lang: Locale
}
```

## Upgrade Workflow

### Phase 1: Extend UserContext with Behavior Data

Add to `UserContext` in `master-agent.ts`:

```typescript
interface UserContext {
    // ... existing fields
    emotionalState?: EmotionalState
    churnRisk?: ChurnRiskLevel
    behaviorProfile?: BehaviorProfile
    lastActivity?: Date
    watchTimeRecent?: number      // minutes in last 7 days
    streakDays?: number
    subscriptionEndsAt?: Date
    purchaseHistory?: string[]    // courseIds
}
```

Fetch this data in `/api/ai/chat/route.ts` POST handler from existing Prisma models:
- `enhancedVideoProgress` → recent watch time, last activity
- `profile` → streak, health data, achievements
- `subscription` → expiration date
- `checkIn` → mood data
- `aiConversation` → chat history patterns

### Phase 2: Emotional Intelligence Engine

Create `src/lib/ai/emotional-engine.ts`. See [references/emotional-engine.md](references/emotional-engine.md) for full specification.

Core function:

```typescript
function detectEmotionalState(input: {
    message: string
    recentMessages: string[]
    activityGap: number
    moodKpi?: number
    timeOfDay: number
}): EmotionalState
```

States: `motivated` | `tired` | `frustrated` | `insecure` | `doubting` | `overwhelmed` | `confident`

### Phase 3: Churn Prediction

Create `src/lib/ai/churn-predictor.ts`. See [references/churn-system.md](references/churn-system.md) for scoring matrix and anti-churn strategies.

Core function:

```typescript
function calculateChurnRisk(input: {
    activityDays: number[]
    watchTimeWeekly: number[]
    chatEngagement: number
    subscriptionDaysLeft: number
    emotionalTrend: EmotionalState[]
    lastLoginDaysAgo: number
}): { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', score: number }
```

### Phase 4: Upgrade MasterAgent.processRequest

Modify `processRequest()` in `master-agent.ts`:

1. Before generating response → detect emotional state
2. Calculate churn risk
3. Inject emotional alignment into system prompt
4. Apply anti-churn strategy if needed
5. Personalize based on health profile
6. Structure response per standard format

### Phase 5: Sales Intelligence

Enhance `subscriptionSalesResponse()` for non-subscribers. See [references/sales-intelligence.md](references/sales-intelligence.md).

Detect: purchase hesitation, objections, price sensitivity, comparison questions.
Respond with: benefit matching, emotional alignment, transformation framing.

### Phase 6: Behavior Memory

Create `src/lib/ai/behavior-memory.ts`. See [references/behavior-memory.md](references/behavior-memory.md).

Store per-user: goals, pain points, emotional history, preferred times, favorite content, complaints.
Load into context for each AI interaction.

### Phase 7: Admin Intelligence Dashboard

Add to admin panel. See [references/admin-dashboard.md](references/admin-dashboard.md).

- Churn risk overview (users at risk)
- Emotional state heatmap
- AI response quality metrics
- Admin controls for tone, scripts, protocols

## Response Structure Standard

Every AI response must follow this 5-part structure:

```
1. Emotional alignment line (empathy/acknowledgment)
2. Personalized insight (based on their data)
3. Clear recommendation (actionable step)
4. Gentle motivation (progress reinforcement)
5. Optional course/module suggestion
```

## AI Personality

- Intelligent, calm, emotionally aware
- Premium wellness strategist + psychologist + coach
- Never robotic, pushy, or generic
- Match language: UZ warm/respectful, RU professional/caring

## Safety Rules (from existing skill)

- NEVER give medical diagnoses
- NEVER promise cures
- NEVER suggest unsafe movements for pregnant users
- NEVER go beyond knowledge base
- Always add disclaimer for pain/injury topics

## File Modification Map

| File | Action |
|---|---|
| `src/lib/ai/master-agent.ts` | Extend UserContext, upgrade processRequest |
| `src/lib/ai/emotional-engine.ts` | NEW — emotional state detection |
| `src/lib/ai/churn-predictor.ts` | NEW — churn risk scoring |
| `src/lib/ai/behavior-memory.ts` | NEW — per-user memory storage |
| `src/lib/ai/sales-intelligence.ts` | NEW — non-subscriber conversion |
| `src/app/api/ai/chat/route.ts` | Extend data fetch for behavior profile |
| `src/app/api/admin/ai/route.ts` | NEW — admin AI dashboard API |
| `src/components/admin/AIIntelligenceDashboard.tsx` | NEW — admin UI |
