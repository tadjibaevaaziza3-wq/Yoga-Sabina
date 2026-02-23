# Emotional Intelligence Engine

## Emotional State Classification

Analyze these signals in real-time:

| Signal | Source | Weight |
|---|---|---|
| Language tone | Current message | High |
| Word choice | Negative/positive lexicon | High |
| Message length | Short = distressed, Long = engaged | Medium |
| Repetition | Same question = frustration | Medium |
| Time of activity | Late night = stress/insomnia | Low |
| Training gap | Days since last session | High |
| Mood KPI | CheckIn model data | High |

## Detection Algorithm

```typescript
type EmotionalState = 'motivated' | 'tired' | 'frustrated' | 'insecure' | 'doubting' | 'overwhelmed' | 'confident'

interface EmotionalSignals {
    message: string
    recentMessages: string[]   // last 5 messages
    activityGapDays: number
    moodKpi?: number           // 1-5 from CheckIn
    hourOfDay: number          // 0-23
    streakDays: number
    subscriptionDaysLeft?: number
}

function detectEmotionalState(signals: EmotionalSignals): {
    state: EmotionalState
    confidence: number        // 0-1
    toneModifiers: string[]   // instructions for response generation
}
```

## Tone Keywords (UZ / RU)

### Tired indicators
- UZ: `charchadim`, `holsizman`, `vaqtim yo'q`, `qiyin`, `uxlolmayapman`
- RU: `устала`, `нет сил`, `тяжело`, `не могу`, `не высыпаюсь`

### Frustrated indicators
- UZ: `ishlamayapti`, `nima uchun`, `yana`, `tushunmayapman`, `bezildim`
- RU: `не работает`, `почему`, `опять`, `не понимаю`, `надоело`

### Insecure indicators
- UZ: `to'g'rimi`, `qila olamanmi`, `qo'rqaman`, `bilmayaman`
- RU: `правильно ли`, `смогу ли`, `боюсь`, `не знаю`

### Doubting purchase
- UZ: `qimmat`, `kerakmi`, `bekor qilish`, `foydasi bormi`
- RU: `дорого`, `нужно ли`, `отменить`, `есть ли смысл`

### Motivated indicators
- UZ: `tayyorman`, `boshlaymiz`, `ajoyib`, `davom etaman`
- RU: `готова`, `начнём`, `отлично`, `продолжаю`

## Tone Adaptation Rules

```
motivated   → Challenge + progress tracking + advanced suggestions
tired       → Soft encouragement + short session recommendation + rest validation
frustrated  → Calming tone + simplified explanation + break suggestion
insecure    → Confidence reinforcement + progress evidence + small wins
doubting    → Value-based reassurance + transformation stories + benefit recap
overwhelmed → Simplify options + one-step-at-a-time approach + breathing exercise
confident   → Performance challenge + next-level content + streak celebration
```

## Integration Point

In `MasterAgent.processRequest()`, before building the system prompt:

```typescript
const emotional = detectEmotionalState({
    message: query,
    recentMessages: history.filter(m => m.role === 'user').map(m => m.content).slice(-5),
    activityGapDays: userCtx.lastActivityDaysAgo || 0,
    moodKpi: userCtx.lastMoodKpi,
    hourOfDay: new Date().getHours(),
    streakDays: userCtx.streakDays || 0,
    subscriptionDaysLeft: userCtx.subscriptionDaysLeft
})

// Inject into system prompt
const toneInstructions = emotional.toneModifiers.join('\n')
```
