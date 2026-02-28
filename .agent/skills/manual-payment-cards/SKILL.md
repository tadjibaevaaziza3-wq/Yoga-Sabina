---
name: manual-payment-cards
description: Strict rules for manual payment card display, multi-card support, payment screenshot workflow, and admin payment verification. Use when implementing payment pages, admin payment features, or card configuration.
---

# Manual Payment Cards — STRICT RULES

> [!CAUTION]
> ## ⚠️ NON-NEGOTIABLE RULES

### 1. Card Credentials Display
- When user selects "Karta raqamiga" (manual card transfer), ALL configured cards MUST be shown
- Each card displays: **card number** (font-mono) + **holder name** (uppercase)
- Cards are stored in `SystemSetting` as `MANUAL_CARDS` JSON: `[{"number":"8600...", "owner":"SABINA POLATOVA"}, ...]`
- There may be **2 or more cards** — always display ALL of them
- Cards must be visible in: **TMA**, **User Panel**, and **Website** checkout pages
- The `CheckoutForm.tsx` component handles all three platforms

### 2. Admin Card Management
- Admin configures cards in **System Settings → 💳 To'lov Kartalari**
- Dynamic card list: admin can add/remove cards (minimum 1)
- Each card has: card number input + holder name input
- Saved as JSON to `MANUAL_CARDS` system setting via `/api/admin/settings`
- Backward compatible with legacy `MANUAL_CARD_NUMBER` / `MANUAL_CARD_OWNER`

### 3. Payment Screenshot Workflow
- User uploads payment screenshot via `TMAFileUpload` component
- Screenshot stored as `screenshotUrl` on the Purchase model
- Screenshot is **required** before user can confirm manual payment
- After upload, order status = `PENDING` until admin approves

### 4. Admin Payment Verification
- **Green row highlight**: Users with `hasPendingPayment: true` have green background in `UserList`
- Admin sees "Kutilmoqda" (Waiting) chip + approve button in the To'lov column
- Admin can view/download the payment screenshot from user details page
- Screenshot is accessible in `PaymentManagement.tsx` and `OrderManagement.tsx`
- After admin approves, user's subscription is activated

### 5. Config API
- `/api/checkout/config` returns `{ cards: [{number, owner}, ...] }`
- Tries `MANUAL_CARDS` JSON first, falls back to legacy single card settings
- If no cards configured, returns placeholder message

## File Locations
| Component | File |
|-----------|------|
| Checkout form | `src/components/checkout/CheckoutForm.tsx` |
| Card config API | `src/app/api/checkout/config/route.ts` |
| Admin settings | `src/components/admin/SystemSettings.tsx` |
| Admin user list | `src/components/admin/users/UserList.tsx` |
| Payment management | `src/components/admin/PaymentManagement.tsx` |
| Order management | `src/components/admin/OrderManagement.tsx` |
| Manual payment API | `src/app/api/payments/manual/create/route.ts` |
