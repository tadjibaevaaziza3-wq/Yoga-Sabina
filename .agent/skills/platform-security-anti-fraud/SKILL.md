---
name: platform-security-anti-fraud
description: Security, anti-fraud, device management, and platform architecture rules for Baxtli Men. TMA sells courses only — no video playback in TMA. User Panel is for watching. Enforces device limits, data retention, Telegram-only password reset, and subscription sharing prevention. Use when implementing auth, password reset, device tracking, TMA flows, user panel access, or any security-related feature.
---

# Platform Security & Anti-Fraud Rules

## ⚠️ CRITICAL: These rules are NON-NEGOTIABLE and must be followed in ALL implementations.

---

## 1. TMA vs User Panel — Separation of Concerns

### TMA (Telegram Mini App) — SALES ONLY
- TMA is **ONLY for selling courses**: browsing, registration, course selection, payment
- **NO video playback** in TMA — never embed or stream videos inside TMA
- **NO lesson listings** — never show lesson titles, lesson names, module content, play buttons, or lock icons
- **NO lesson navigation** — never link to `/tma/player/` or any video route from TMA
- TMA course page shows ONLY: cover image, title, description, features, price, total lesson/module COUNT (numbers only), and buy button
- After purchase, the "KO'RISHNI BOSHLASH" button redirects to **User Panel** (`/learn/{courseId}`), NOT to a TMA video player
- Provide a direct link to the User Panel with auto-login token if possible
- TMA features allowed:
  - Course catalog browsing (cover + title + price ONLY)
  - User registration / sign-in  
  - Course details and pricing (NO lesson content)
  - Payment processing
  - Subscription management (view status, renew)
  - AI assistant chat
  - Daily check-in
- TMA features **STRICTLY FORBIDDEN**:
  - Lesson titles, names, or descriptions
  - Play/Lock icons next to lessons
  - Module accordion/expandable lesson lists
  - Any video player component
  - Any link to `/tma/player/*`

### User Panel (Web) — VIDEO WATCHING ONLY
- All video playback happens exclusively in the User Panel
- When user arrives from TMA link, **re-verify credentials** before granting access
- Never trust TMA tokens alone — always validate server-side
- User Panel features:
  - Video streaming with DRM/watermark
  - Progress tracking
  - Comments, likes, favorites
  - Course learning interface
  - KPI dashboard

---

## 2. Password Reset — Telegram Only

### Rules
- Password reset codes and new passwords must be sent **ONLY via Telegram** to the user's registered Telegram account
- **NEVER** send passwords via email or SMS — Telegram is the single source of truth
- Flow:
  1. User requests password reset (enters phone number)
  2. System finds user by phone → gets their `telegramId`
  3. Send OTP/new password via Telegram Bot to that `telegramId`
  4. User enters OTP or uses new password to log in
- If user has no `telegramId` linked → they must first link via TMA
- Log all password reset attempts with timestamp, IP, and device info

### Why Telegram Only
- Prevents SIM-swap fraud (SMS interception)
- Telegram accounts are harder to compromise than email
- Provides audit trail via bot message history

---

## 3. Device Management — Max 3 Devices

### Device Tracking
- On every login, capture and store device fingerprint:
  - `userAgent` (browser/OS)
  - `screenResolution`
  - `timezone`
  - `platform`
  - IP address (for reference, not as primary identifier)
- Store in a `UserDevice` model with fields:
  - `id`, `userId`, `fingerprint`, `deviceName`, `userAgent`
  - `lastUsed`, `createdAt`, `isBlocked`, `ipAddress`

### Enforcement Rules
1. **≤ 3 devices**: Normal access, no warnings
2. **4th device attempt**: 
   - Block login on new device
   - Show message: "Siz 3 ta qurilmadan foydalanmoqdasiz. Yangi qurilma qo'shish uchun mavjud qurilmalardan birini o'chiring"
   - Show list of current 3 devices with option to remove one
3. **Repeated violations (5+ device attempts in 24 hours)**:
   - Auto-block the user account temporarily
   - Send admin notification: "⚠️ FRAUD ALERT: User {name} ({phone}) attempted login from {count} different devices in 24 hours"
   - Admin can review and take action (warn, block permanently, or whitelist)

### Admin Actions
- Admin panel shows device history per user
- Admin can:
  - View all devices (current + historical)
  - Force-remove devices
  - Block/unblock user
  - Send warning message via Telegram Bot
  - Mark user as "verified" (trusted, no device limits)

---

## 4. Data Retention — NEVER Delete User Data

### Core Principle
> **ALL data entered by a user must be permanently retained. NEVER hard-delete user records.**

### Specific Rules
- **Phone numbers**: If user changes phone, keep the old one in `phoneHistory` array
- **Email addresses**: If user changes email, keep old one in `emailHistory`
- **Telegram IDs**: If user unlinks Telegram, keep the old ID with timestamp
- **Addresses, names**: All changes create a history entry
- **Account deletion**: Soft-delete only (`deletedAt` timestamp, `isDeleted` flag)
- **Subscription changes**: Full audit log of every status change

### Implementation
- Use a `UserDataHistory` model:
  ```
  model UserDataHistory {
    id        String   @id @default(cuid())
    userId    String
    field     String   // "phone", "email", "name", "telegramId"
    oldValue  String
    newValue  String
    changedAt DateTime @default(now())
    changedBy String   // "user" or "admin:{adminId}"
    ipAddress String?
    reason    String?  // "user_request", "admin_action", "fraud_prevention"
  }
  ```
- Before ANY user field update, create a history entry with the old value

---

## 5. Subscription Sharing Prevention

### Rules
- Each subscription is tied to ONE user account
- Subscriptions cannot be transferred between accounts
- If suspicious sharing is detected (multiple devices, different locations), flag for admin review

### Detection Signals
- Same subscription accessed from > 3 devices
- Simultaneous video playback from 2+ locations
- Login from geographically impossible locations (e.g., Tashkent and Moscow within 1 hour)

### Response
1. First offense: Warning via Telegram
2. Second offense: Temporary 24-hour block
3. Third offense: Permanent block + admin notification
4. Admin reviews and decides: unblock, extend block, or ban

---

## 6. Fraud Alert System

### Admin Notifications (via Telegram Bot)
The system must send real-time alerts to admin for:
- ⚠️ Device limit exceeded (5+ attempts)
- ⚠️ Suspicious login pattern (impossible travel)
- ⚠️ Multiple failed password attempts (> 5 in 10 min)
- ⚠️ User changed phone number
- ⚠️ Account blocked automatically
- ⚠️ Subscription sharing suspected

### Alert Format
```
⚠️ FRAUD ALERT
User: {firstName} {lastName}
Phone: {phone}
Telegram: @{username}
Type: {alert_type}
Details: {description}
Time: {timestamp}
Action needed: {recommended_action}
```

---

## 7. Authentication Flow Summary

### Registration (TMA)
1. User opens TMA → enters phone + creates password
2. Telegram ID auto-linked from TMA context
3. Store: phone, password (hashed), telegramId, device fingerprint
4. User browses courses → purchases → gets subscription

### Login (User Panel)
1. User enters phone + password
2. Verify credentials server-side
3. Check device fingerprint against allowed devices
4. If new device and < 3 total → add device, allow login
5. If new device and ≥ 3 total → block, show device manager
6. On success → grant JWT token with short expiry (24h)

### Password Reset
1. User clicks "Forgot password" → enters phone
2. System sends OTP to Telegram (NOT SMS/email)
3. User enters OTP → creates new password
4. Log the reset event with device + IP info

---

## 8. Implementation Checklist

When implementing any auth or security feature, verify:
- [ ] Passwords sent only via Telegram, never email/SMS
- [ ] Device fingerprint captured on every login
- [ ] Device count checked before allowing new device
- [ ] User data changes logged in history (never hard deleted)
- [ ] Subscription access limited to single user
- [ ] Admin fraud alerts sent for suspicious activity
- [ ] TMA has NO video playback functionality
- [ ] User Panel re-verifies credentials on access from TMA
