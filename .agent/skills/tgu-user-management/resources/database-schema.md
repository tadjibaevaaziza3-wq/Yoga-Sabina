# Database Schema

The following tables define the core of the enterprise-level user and payment tracking system.

## Schema Definition

### 1. `users`
Core user identity and contact data.
- `id` (UUID/CUID)
- `full_name` (String)
- `phone` (String, unique)
- `telegram_id` (String, unique)
- `telegram_username` (String)
- `region` (String)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 2. `subscriptions`
Tracks active access rights.
- `id` (Serial)
- `user_id` (FK -> users.id)
- `status` (Enum: ACTIVE, EXPIRED, CANCELED)
- `starts_at` (DateTime)
- `ends_at` (DateTime)
- `plan_type` (Enum: MONTHLY, YEARLY, FOREVER)

### 3. `payments`
Tracks all incoming revenue.
- `id` (Serial)
- `user_id` (FK -> users.id)
- `method` (Enum: CLICK, MANUAL, APPLE)
- `amount` (Decimal)
- `status` (Enum: PENDING, PAID, FAILED)
- `click_transaction_id` (String, nullable)
- `screenshot_url` (String, nullable)
- `verified_by_admin` (Boolean)
- `created_at` (DateTime)

### 4. `event_logs`
High-frequency behavioral tracking.
- `id` (Serial)
- `user_id` (FK -> users.id)
- `event_type` (String: LOGIN, PAGE_VIEW, VIDEO_HEARTBEAT)
- `course_id` (FK, optional)
- `video_id` (String, optional)
- `duration_seconds` (Int)
- `metadata` (JSONB: Device, IP, Resolution)
- `timestamp` (DateTime)

### 5. `video_views`
Aggregated video completion metrics.
- `id` (Serial)
- `user_id` (FK -> users.id)
- `video_id` (String)
- `watch_time` (Int: Total seconds)
- `completed_percentage` (Float: 0.0 to 1.0)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 6. `admin_users`
Access control for the tracking system.
- `id` (Serial)
- `username` (String)
- `role` (Enum: SUPER_ADMIN, ANALYTICS, MANAGER)
- `last_active` (DateTime)
