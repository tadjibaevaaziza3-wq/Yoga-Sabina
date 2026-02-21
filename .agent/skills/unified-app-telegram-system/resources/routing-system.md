# Routing & Deep Linking System

## 1. Unified Route Structure

The application routing should mirror across platforms where possible.

| Page | Web Path | Deep Link Parameter |
| :--- | :--- | :--- |
| **Home** | `/dashboard` | `start=dashboard` |
| **Course Details** | `/courses/:id` | `start=course_:id` |
| **Profile** | `/profile` | `start=profile` |
| **Payment** | `/checkout?plan=:id` | `start=checkout_:id` |

## 2. Telegram Deep Linking

Telegram bots support a `start` parameter: `t.me/mybot/app?startapp=command`.

**Handling Logic in TMA:**
1.  Read `startapp` parameter from `initData`.
2.  Map `command` to internal route.
3.  **Execute Client-Side Redirect** immediately after auth.

**Example Code (Client):**
```typescript
const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

if (startParam && startParam.startsWith('course_')) {
  const courseId = startParam.split('_')[1];
  router.push(`/courses/${courseId}`);
}
```

## 3. Cross-Platform Sharing

When a user shares a link from the Web App, it should optionally be convertible to a Telegram Deep Link for mobile users.

- **Web Link**: `https://baxtli.men/courses/123`
- **Telegram Link**: `https://t.me/baxtlimen_bot/app?startapp=course_123`

## 4. Protected Routes

All deep links must pass through the **Authentication Guard**.

- **Scenario**: User clicks deep link to "Premium Course".
- **Step 1**: Auth Check (Auto-login via `initData`).
- **Step 2**: Permission Check (Does user have subscription?).
- **Step 3**:
    - *If Allowed*: Show Course.
    - *If Denied*: Redirect to Payment Page with "Access Denied" toast.
