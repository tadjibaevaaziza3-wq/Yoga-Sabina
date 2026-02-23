# Behavior Memory System

## Per-User Memory Storage

Use existing `Profile` model's JSON fields or create a dedicated memory store.

### Memory Categories

```typescript
interface UserBehaviorMemory {
    goals: string[]              // "lose weight", "reduce back pain", "flexibility"
    painPoints: string[]         // "lower back", "insomnia", "stress"
    emotionalHistory: Array<{
        state: EmotionalState
        timestamp: Date
    }>
    preferredTime: string        // "morning" | "evening" | "afternoon"
    favoriteContent: string[]    // courseIds or lesson types
    complaints: string[]         // extracted from chat
    lastMentionedTopics: string[]
    conversionStatus: 'visitor' | 'trial' | 'subscriber' | 'churning' | 'reactivated'
}
```

### Memory Extraction

From each chat interaction, extract and update:

1. **Goals** — when user mentions objectives ("I want to...", "my goal is...")
2. **Pain points** — health complaints, frustrations
3. **Preferred time** — analyze login/activity time patterns
4. **Favorite content** — most watched/liked lessons
5. **Complaints** — negative feedback, feature requests

### Storage

Use Prisma `Profile.achievements` (existing JSON field) or add `behaviorMemory Json?` to Profile model:

```prisma
model Profile {
    // ... existing fields
    behaviorMemory  Json?    // UserBehaviorMemory
}
```

### Memory Loading

In `/api/ai/chat/route.ts`, load memory before building UserContext:

```typescript
const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { behaviorMemory: true, /* ... existing fields */ }
})

const memory = profile?.behaviorMemory as UserBehaviorMemory | null
```

### Memory Usage in Prompts

Inject memory summary into system prompt:

```
User memory context:
- Goals: ${memory.goals.join(', ')}
- Known pain points: ${memory.painPoints.join(', ')}
- Prefers: ${memory.preferredTime} sessions
- Emotional trend: ${recentEmotionalTrend}
- Previous complaints: ${memory.complaints.slice(-3).join(', ')}
```

### Memory Update

After each AI response, extract new memory points:

```typescript
async function updateBehaviorMemory(
    userId: string,
    message: string,
    existingMemory: UserBehaviorMemory
): Promise<UserBehaviorMemory> {
    // Extract goals, pain points, complaints from message
    // Merge with existing memory
    // Save to database
}
```

## Health Intelligence Integration

### Profile-Based Response Rules

| Profile | Rule |
|---|---|
| Pregnant | ONLY prenatal-safe suggestions, no inversions, no core pressure |
| 45+ female + hormonal | Gentle sessions, hormone-balancing sequences |
| Overweight + active streak | Progressive challenge, fat burn focus |
| Back pain history | Avoid contraindicated poses, suggest therapeutic alternatives |
| Post-injury | Modified sequences only, always add specialist disclaimer |

### Response Personalization

The AI must use health data to filter recommendations:

```typescript
function filterSafeRecommendations(
    suggestions: LessonSuggestion[],
    healthProfile: { isPregnant: boolean, healthIssues: string, age: number, gender: string }
): LessonSuggestion[]
```

Remove any lesson that could be unsafe for the user's profile.
