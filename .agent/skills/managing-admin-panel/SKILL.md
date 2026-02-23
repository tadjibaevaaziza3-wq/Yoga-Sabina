---
name: managing-admin-panel
description: >
  React-Admin based management system for Baxtli Men yoga platform.
  Use when building, upgrading, or maintaining the Admin Panel — including
  multi-admin auth, role-based permissions, KPI dashboards, user/lead management,
  automation triggers, financial reports, course management, real-time monitoring,
  or admin action logging. Triggers on any admin panel work.
---

# Managing Admin Panel

## Architecture Overview

The admin panel lives at `/{lang}/admin` and uses **React-Admin** as a full SPA.
Current stack: Next.js 15, React-Admin, Prisma (PostgreSQL), MUI, Recharts, Lucide icons.

### Key Paths

| Layer | Path |
|---|---|
| Main page | `src/app/[lang]/admin/page.tsx` |
| React-Admin entry | `src/components/admin/ReactAdminApp.tsx` |
| API routes (generic) | `src/app/api/admin/ra/[resource]/route.ts` |
| API routes (by id) | `src/app/api/admin/ra/[resource]/[id]/route.ts` |
| Custom inputs | `src/components/admin/inputs/*.tsx` |
| Resources | `src/components/admin/{resource}/index.tsx` |
| Theme | `src/lib/admin/theme.ts` |
| i18n Provider | `src/lib/admin/i18nProvider.ts` |
| Auth Provider | `src/lib/admin/authProvider.ts` |
| Data Provider | `src/lib/admin/dataProvider.ts` |
| Prisma schema | `prisma/schema.prisma` |

### Resources (React-Admin)

| Resource | Model | Label (UZ) |
|---|---|---|
| users | User | Foydalanuvchilar |
| courses | Course | Kurslar |
| lessons | Lesson | Darslar |
| consultations | Purchase (filtered) | Konsultatsiyalar |
| announcements | Announcement | E'lonlar |
| feedbacks | Feedback | Fikr-mulohazalar |
| appcontents | AppContent | Kontent |
| aitrainings | AiTraining | AI sozlamalar |
| faqs | FAQ | Savol-javoblar |
| chatmessages | ChatMessage | Xabarlar |
| coursechats | CourseChat | Kurs chatlari |
| automations | Trigger | Avtomatizatsiya |
| purchases | Purchase | (UserShow) |
| subscriptions | Subscription | (UserShow) |
| assets | Asset | (LessonShow) |
| comments | Comment | (LessonShow) |

### Custom Input Components

| Component | Purpose |
|---|---|
| `GcsImageInput` | Image upload with crop modal (react-easy-crop), configurable aspect ratio |
| `GcsVideoInput` | Video upload to GCS with progress bar |
| `GcsFileInput` | Generic file upload (audio, PDF, PPT) with signed-URL + progress |
| `TranslatableTextInput` | Side-by-side 🇺🇿 UZ / 🇷🇺 RU columns with arrow translate button |

### Lesson Media Structure

Each lesson supports multiple media types:

| Field | Type | Purpose |
|---|---|---|
| `videoUrl` | Video | Main lesson video |
| `audioUrl` | Audio | Background audio (meditation, music) |
| `pdfUrl` | File | PDF/PPT documents |
| `content` | Text | Written lesson content |
| `thumbnailUrl` | Image | Lesson cover image |
| `searchKeywords` | String | Comma-separated search terms |

LessonEdit uses 3 tabs: **Asosiy** (metadata) → **Media** (video + audio + thumbnail) → **Fayllar** (PDF + text).

User-facing `DualMediaPlayer` (`src/components/user/DualMediaPlayer.tsx`) syncs video + audio with independent volume controls.

---

## Design Requirements

- **Light theme** — bright white + green
- `background.default: '#f5f7f5'`, `background.paper: '#ffffff'`
- `primary.main: '#114539'` (dark green from logo)
- `secondary.main: '#0a8069'` (medium green accent)
- `text.primary: '#1a2e1a'`, `text.secondary: '#5a6b5a'`
- All UI labels in **Uzbek** (i18nProvider)
- Responsive grid, rounded corners (14px), subtle green shadows

---

## Multi-Admin System

### Database Models

Already in `prisma/schema.prisma`:

```prisma
model AdminUser {
  id             String   @id @default(cuid())
  username       String   @unique
  email          String?  @unique
  passwordHash   String
  displayName    String
  avatar         String?
  role           AdminRole @default(ADMIN_ROLE)
  permissions    Json     @default("[]")
  isActive       Boolean  @default(true)
  lastLoginAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  createdById    String?
  createdBy      AdminUser? @relation("AdminCreatedBy", fields: [createdById], references: [id])
  createdAdmins  AdminUser[] @relation("AdminCreatedBy")
  actionLogs     AdminActionLog[]
}
```

### Permissions System

SUPER_ADMIN has all permissions. ADMIN_ROLE gets only what's granted:

```typescript
const ALL_PERMISSIONS = [
  'users.view', 'users.edit', 'users.delete', 'users.create',
  'subscriptions.view', 'subscriptions.grant', 'subscriptions.manage',
  'courses.view', 'courses.create', 'courses.edit', 'courses.delete',
  'payments.view', 'payments.verify',
  'leads.view', 'leads.message',
  'analytics.view', 'analytics.export',
  'automation.view', 'automation.manage',
  'messages.send', 'messages.broadcast',
  'settings.view', 'settings.edit',
  'logs.view',
] as const
```

---

## Dashboard Analytics

Dashboard fetches all data from `/api/admin/analytics` (single API call). Uses Recharts for charts.

### API: `src/app/api/admin/analytics/route.ts`

Returns a single JSON with:
- **totals**: users, courses, lessons, activeSubscriptions, totalRevenue, monthlyRevenue, activeUsers7d, avgDaysToFirstPurchase
- **timeSeries**: registrations (30d daily), revenue (30d daily), subscriptions (30d daily), cumulativeUsers (90d weekly)
- **courseKPIs**: per-course metrics (activeSubscribers, totalPurchases, totalLessons, totalWatches, totalLikes)
- **mostWatched**: top 10 videos by watch count
- **mostFavorited**: top 10 lessons by favorite count

### UI Components (`src/components/admin/dashboard/Dashboard.tsx`)

| Section | Type | Data |
|---|---|---|
| KPI Cards (row 1) | 4 StatCards | Users, Active Subs, Monthly Revenue, Avg Purchase Time |
| KPI Cards (row 2) | 4 StatCards | Courses, Lessons, Total Revenue, Active Users (7d) |
| Registration chart | Recharts AreaChart | 30-day daily user registrations |
| Revenue chart | Recharts AreaChart | 30-day daily revenue |
| Subscription chart | Recharts LineChart | 30-day daily new subscriptions |
| Growth chart | Recharts AreaChart | 90-day cumulative user growth |
| Course KPI table | MUI Table | Per-course subscribers, purchases, watches, likes |
| Most watched | Ranked list | Top 10 videos by view count |
| Most favorited | Ranked list | Top 10 lessons by favorite count |

## Key Business Rules

- **All courses are paid** — no free course toggle
- **Translations**: UZ is primary, RU is auto-generated via `/api/admin/translate`
- **Announcements**: Admin broadcasts to users via User Panel and Telegram Bot
- **Consultations**: Full CRUD on `Course` records where `productType = CONSULTATION`. Admin can create/edit/delete, toggle visibility (`isActive`), set format/location/schedule, and upload cover image.
