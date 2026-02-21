# User Tracking

This system enforces mandatory tracking for all TGU Users (Application and TMI). Every interaction is serialized and presented in the Admin Panel for centralized oversight.

## Mandatory Interface: Admin Panel → TGU Users

The "TGU Users" dashboard is the source of truth. NO USER can exist in the system without appearing here.

### 1. Unified User Record
For every user registered, the system MUST store and display:
- **Full Identity**: `full_name`, `phone_number`, `telegram_id`, `telegram_username`.
- **System Identifiers**: `userNumber` (Internal numeric ID), `CUID` (Identity string).
- **Temporal Data**: `registration_date`, `last_login_date`, `last_active_timestamp`.
- **Contextual Data**: `region`.

### 2. Deep Behavioral Logging
The following data MUST be captured in the `event_logs` table:
- **Navigation History**: Which courses were opened and when.
- **Specific Engagement**: The exact `video_id` or `lesson_id` accessed.
- **Duration Tracking**: 
    - **Session Duration**: How long the user stayed on a specific page/video.
    - **Watch Progress**: Heartbeats sent every 10 seconds to calculate exact time spent.
- **Completion metrics**: Automatically calculated based on video duration vs. watch logs.

## Video Analytics Logic
- Every video play triggers a `video_open` event.
- Continuous heartbeats update `watch_time` for that specific video-user pair.
- Admin view must show: "User X watched 85% of Lesson 2 (Total: 42m 12s)".
