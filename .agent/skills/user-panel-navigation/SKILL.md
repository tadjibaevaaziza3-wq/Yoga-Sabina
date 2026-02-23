---
name: user-panel-navigation
description: Fix navigation logic inside the User Panel. Use when authenticated users are being redirected to public/main application pages for course viewing, course details, or any course-related content. Ensures all course pages, previews, and details open INSIDE the User Panel layout with consistent sidebar and header. Triggers on: navigation fixes, routing issues in user panel, course redirect problems, layout consistency for logged-in users, subscription modal instead of redirect.
---

# User Panel Navigation Fix

Fix routing so authenticated users NEVER leave the User Panel layout for course-related content.

## Core Rule

If user is authenticated and inside User Panel → ALL course-related pages open INSIDE User Panel layout. No redirects to public application routes.

## Current Architecture

```
src/app/[lang]/(user)/           ← User Panel route group
├── layout.tsx                   ← Shared layout (sidebar + header)
├── account/page.tsx             ← Dashboard
├── activity/page.tsx            ← Activity stats
├── all-courses/page.tsx         ← Browse courses
├── my-courses/page.tsx          ← Enrolled courses
├── learn/page.tsx               ← Learning hub
├── learn/[id]/page.tsx          ← Course player
├── chat/page.tsx                ← Chat
├── kpi/page.tsx                 ← KPI
├── profile/page.tsx             ← Profile
└── settings/page.tsx            ← Settings
```

Public routes (separate):
```
src/app/[lang]/courses/          ← Public course listing
src/app/[lang]/courses/[slug]/   ← Public course detail
```

## Routing Rules

### Required Routes (all under `(user)/`)

| Route | Purpose |
|---|---|
| `/(user)/all-courses` | Browse all available courses |
| `/(user)/all-courses/[id]` | Course detail (inside panel) |
| `/(user)/my-courses` | User's subscribed courses |
| `/(user)/learn/[id]` | Video player for subscribed course |

### What to Fix

1. **Course detail page** — Create `/(user)/all-courses/[id]/page.tsx` if missing. Course cards in `all-courses` must link to `/${lang}/all-courses/${course.id}`, NOT to `/courses/${slug}`.

2. **Course cards in `my-courses`** — Links must point to `/${lang}/learn/${courseId}`, NOT to public routes.

3. **Any `<Link>` or `router.push`** pointing to `/courses/` from inside `(user)/` routes — Replace with `(user)/` equivalents.

4. **Subscription check** — If user is NOT subscribed to a course, show an upgrade modal inside the panel. Do NOT redirect to public pricing page.

## Implementation Steps

### Step 1: Audit Links

Search all files under `src/app/[lang]/(user)/` and `src/components/` for links pointing to public routes:

```
grep -r "\/courses\/" src/app/[lang]/(user)/ src/components/
grep -r "router.push.*courses" src/app/[lang]/(user)/ src/components/
```

Replace any `/courses/` links with User Panel equivalents.

### Step 2: Create Course Detail Page (if missing)

Create `src/app/[lang]/(user)/all-courses/[id]/page.tsx`:
- Fetch course data from existing API (`/api/courses/[id]` or prisma direct)
- Render course info (title, description, modules, lessons)
- If user has subscription → show "Start Learning" button → link to `/(user)/learn/[id]`
- If user does NOT have subscription → show upgrade modal with pricing info
- Keep full User Panel layout (sidebar + header visible)

### Step 3: Subscription Guard Modal

Create a `SubscriptionModal` component or use existing one:
- Show course preview (locked state)
- Display pricing info
- "Upgrade" button → opens payment flow (Telegram or payment page)
- Do NOT redirect to public `/pricing` or `/courses/` pages

### Step 4: Layout Consistency

Verify `(user)/layout.tsx` wraps all child routes with:
- Left sidebar with navigation
- Top header with profile
- Internal page switching without full page reload

### Step 5: Verify No Leaks

After changes, verify:
- Click every course card → opens inside panel
- Click course tags/instructor → stays inside panel
- Unsubscribed course → shows modal, not redirect
- Back button → returns to panel page, not public site
- URL bar always shows `/(user)/` prefix paths

## Anti-Patterns to Avoid

- ❌ `<Link href={\`/\${lang}/courses/\${slug}\`}>` from inside user panel
- ❌ `router.push('/courses/...')` from user panel components
- ❌ `window.location.href = '/pricing'` for subscription upgrade
- ❌ Rendering course detail inside public layout when user is logged in

## Correct Patterns

- ✅ `<Link href={\`/\${lang}/all-courses/\${id}\`}>` from user panel
- ✅ `<Link href={\`/\${lang}/learn/\${id}\`}>` for subscribed courses
- ✅ `<SubscriptionModal>` for upgrade prompts
- ✅ All routes stay under `(user)/` group with shared layout
