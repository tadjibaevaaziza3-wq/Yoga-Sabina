# Admin AI Intelligence Dashboard

## API Route: `/api/admin/ai/route.ts`

### GET — Dashboard Data

Return aggregated intelligence data:

```typescript
{
    churnOverview: {
        critical: number,  // users at critical risk
        high: number,
        medium: number,
        low: number,
        users: Array<{
            id: string
            name: string
            churnScore: number
            level: ChurnRiskLevel
            lastActivity: Date
            subscriptionEndsAt: Date
        }>
    },
    emotionalHeatmap: Array<{
        state: EmotionalState
        count: number
        percentage: number
    }>,
    conversionMetrics: {
        totalNonSubscribers: number
        aiInteractions: number
        conversions: number
        conversionRate: number
    },
    responseQuality: {
        averageSatisfaction: number  // if feedback implemented
        totalResponses: number
        topTopics: Array<{ topic: string, count: number }>
    }
}
```

## Admin Panel Component

### Location: `src/components/admin/AIIntelligenceDashboard.tsx`

### Layout

4-section dashboard:

1. **Churn Risk Panel** — Table of at-risk users sorted by score, with action buttons
2. **Emotional Heatmap** — Donut chart showing emotional state distribution
3. **Conversion Tracker** — Bar chart of AI-driven conversions over time
4. **Response Quality** — Recent AI responses with quality indicators

### Admin Controls

Admin can:

| Control | Effect |
|---|---|
| Adjust tone intensity | Scale 1-5, affects emotional alignment strength |
| Add sales scripts | Custom responses for specific objection patterns |
| Add health protocols | New safety rules for specific conditions |
| Approve learning entries | Review and approve AI-extracted knowledge |
| View user emotional timeline | See emotional state progression per user |

### Integration

Add tab in existing admin page (`src/app/[lang]/admin/page.tsx`):

```tsx
{ label: 'AI Intelligence', icon: <Brain />, component: <AIIntelligenceDashboard /> }
```

Requires `SUPER_ADMIN` or `ai_dashboard` permission.
