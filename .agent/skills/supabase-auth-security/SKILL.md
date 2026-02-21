# Supabase Auth & Security Skill

Master Agent for Secure Supabase Authentication and Anti-Piracy measures. This skill ensures that the Baxtli Men platform remains exclusive, preventing account sharing and unauthorized video streaming.

## Core Principles

1.  **One Phone = One Account**: Use Supabase Phone Auth as the unique identifier.
2.  **Device Binding**: Limit each user to 1-2 recognized devices.
3.  **Simultaneous Stream Control**: Strictly prevent a single account from watching multiple videos at once.
4.  **Proactive Defense**: Heartbeat-based session tracking and automatic logouts for suspicious activity.

## Implementation Standards

### 1. Supabase Phone Auth
- **Provider**: Twilio or Vonage.
- **Rules**:
    - `signInWithOtp`: Send SMS to the user's phone.
    - `verifyOtp`: Validate the 6-digit code.
    - Profiles must be updated with `firstName`, `lastName`, and `phone` post-verification.

### 2. Device Binding
- **Fingerprinting**: Collect `device_id` (OS, Model, Screen resolution) on the client side.
- **Table**: `UserDevice`
    - Fields: `userId`, `deviceId`, `lastSeen`, `userAgent`.
    - Limit: Maximum 2 devices per user.
- **Logic**: If a new device attempts to login and the limit is reached, require the user to "Confirm New Device" via a new SMS OTP or logout an existing one.

### 3. Stream Reservation System
- **Table**: `ActiveStream`
    - Fields: `userId`, `deviceId`, `startedAt`.
- **Pipeline**:
    1.  **Request**: Client calls `/api/videos/play` before starting HLS.
    2.  **Check**: Server verifies active subscription AND checks if `ActiveStream` exists for this user.
    3.  **Lock**: If free, insert record.
    4.  **Heartbeat**: Client sends a ping every 30-60 seconds to keep the record alive.
    5.  **Release**: Delete record on video stop, page close, or timeout.

### 4. Shopify/PayMe Subscription Sync
- **Webhook**: Listen for `subscription_paid` or `order_performed`.
- **Validation**: Verify signature and update `User.expiryDate`.
- **Enforcement**: Middleware must check `expiryDate > now()` for all protected routes.

## Security Tactics
- **IP Detection**: Track `ipAddress` on every device login. Flag jumps (e.g., from different countries within minutes).
- **Session Purge**: Provide "Logout from all devices" in the user profile to clear the `UserDevice` table.
- **HLS Protection**: Use time-limited signed URLs (30 min) generated only after passing the Stream Reservation check.
