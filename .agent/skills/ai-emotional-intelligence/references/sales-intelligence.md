# Sales Intelligence Mode

## Target: Non-Subscribed Users

### Detection Triggers

| Pattern | Signal |
|---|---|
| Purchase hesitation | Asks about price → then goes silent |
| Objection patterns | "too expensive", "not sure", "maybe later" |
| Price sensitivity | Asks about discounts, free content, comparisons |
| Course comparison | "which course is better", "what's the difference" |

### Hesitation Keywords (UZ / RU)

```
UZ: qimmat, keyin ko'raman, o'ylab ko'raman, hozir emas, boshqa kurs, farqi nima
RU: дорого, потом посмотрю, подумаю, не сейчас, другой курс, какая разница
```

## Response Strategy

### 1. Benefit Matching
Map user's health profile to course benefits:
```
healthIssues: "back pain" → "This course includes 12 sessions specifically for spinal health"
gender: "female" + age: 40+ → "Designed for hormonal balance and bone density support"
```

### 2. Emotional Alignment
Match response to detected emotional state:
```
insecure → "Many of our members started exactly where you are now"
doubting  → "Let me show you what you'll gain in the first week alone"
```

### 3. Transformation Framing
Structure: Problem → Solution → Evidence
```
"Back pain affects everything — sleep, mood, energy.
Our members report 60% improvement in 3 weeks.
The first 2 lessons are free — try them and feel the difference."
```

### 4. Soft Urgency
Never pressure. Create awareness:
```
"The current pricing includes full access to all new content added this month"
"Your free trial lessons are available right now — no commitment needed"
```

### 5. Value Reinforcement (for doubting subscribers)
Show ROI of subscription:
```
"In the last month, you've completed [X] sessions.
That's [Y] hours of professional guidance — worth [Z] if booked individually.
Your subscription gives you unlimited access to all of this."
```

## Integration

In `MasterAgent.processRequest()`, when `!userCtx.isSubscribed`:

```typescript
if (!userCtx.isSubscribed && detectSalesOpportunity(query)) {
    const salesResponse = generateSalesIntelligenceResponse({
        query,
        healthProfile: userCtx,
        emotionalState,
        lang
    })
    // Blend with normal response, don't be pushy
}
```
