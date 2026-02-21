# Subscription Control

The Admin Panel must provide proactive management of active user subscriptions to maximize retention and ensure secure access.

## Active Users Dashboard
A dedicated view in the Admin Panel showing:
- **Comprehensive List**: All users with an `Active` status.
- **Expiry Priority**: Sorted by `end_date` (nearest first).
- **Proactive Highlighting**:
    - **RED**: Expires in $\le 3$ days.
    - **ORANGE**: Expires in $\le 7$ days.
    - **BLUE**: Renewal already paid (extension pending).

## Automatic Reminder System
The system must trigger notifications based on the following schedule:

| Days to Expiry | Frequency | Channel | Message Content |
|----------------|-----------|---------|-----------------|
| 3 Days | Once | Telegram/App | Early notice + renewal offer |
| 2 Days | Once | Telegram/App | Urgent reminder |
| 1 Day | Twice | Telegram/SMS | Final notice |
| Expired | Immediate | Telegram | Lock notification + renewal link |

## Expiration Lifecycle
When `now() > subscription_end`:
1. Update `status = EXPIRED` in `subscriptions` table.
2. Automatiaclly lock premium content controllers.
3. Move user entry to the "Expired" list in Admin Panel.
4. Revoke active signed URLs and release active stream locks.
5. Send final "Renewal Message" with a 1-click payment link.

## Notification Channels
- **In-app**: Toast notifications or modal popups on login.
- **Telegram**: High-priority bot messages.
- **SMSO (Optional)**: Failover if Telegram/App delivery fails.
