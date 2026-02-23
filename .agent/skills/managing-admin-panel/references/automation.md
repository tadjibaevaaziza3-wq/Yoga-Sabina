# Automation Trigger System

## Trigger Conditions

| Condition Key | Description | Parameters |
|---|---|---|
| `subscription_expiring` | Subscription expires within N days | `days: number` |
| `user_inactive` | User has not logged in for N days | `days: number` |
| `registered_not_subscribed` | Registered but never purchased | `days_since_registration: number` |
| `subscription_deleted` | Subscription was cancelled/expired | — |
| `new_registration` | User just registered | — |
| `payment_unverified` | Payment uploaded but not verified | `hours: number` |

## Action Types

| Action | Description |
|---|---|
| `send_telegram_text` | Send text message via Telegram bot |
| `send_telegram_media` | Send media (video/audio/image) via bot |
| `send_email` | Send email notification (future) |
| `grant_trial` | Auto-grant trial subscription |
| `flag_for_review` | Add to admin review queue |

## Template Variables

Templates support these variables:
- `{{user.firstName}}` — User's first name
- `{{user.phone}}` — User's phone
- `{{subscription.expiresAt}}` — Subscription expiry date
- `{{subscription.daysRemaining}}` — Days until expiry
- `{{course.title}}` — Last viewed course title
- `{{admin.name}}` — Admin who set up the trigger

## Execution

Triggers checked via cron job or Next.js API route called periodically.
Each execution logs to `AdminActionLog` with `action: 'automation_executed'`.

## Database Schema

```prisma
model AutomationTrigger {
  id          String   @id @default(cuid())
  name        String
  condition   String
  parameters  Json     @default("{}")
  action      String
  template    String?  @db.Text
  mediaUrl    String?
  mediaType   String?
  isActive    Boolean  @default(true)
  lastRunAt   DateTime?
  runCount    Int      @default(0)
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AutomationLog {
  id          String   @id @default(cuid())
  triggerId   String
  userId      String
  action      String
  result      String?
  createdAt   DateTime @default(now())
}
```
