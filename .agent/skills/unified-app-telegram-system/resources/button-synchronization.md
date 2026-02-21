# Button Synchronization Strategy

## 1. The "One Action, One Endpoint" Rule

To ensure consistent behavior, **no UI button is allowed to execute custom logic** beyond calling a standardized API endpoint.

| Button Name | Action | API Endpoint | Payload |
| :--- | :--- | :--- | :--- |
| **Start Course** | User starts a course | `POST /api/courses/:id/start` | `{}` |
| **Complete Lesson** | User finishes video | `POST /api/progress/complete` | `{ lessonId: string }` |
| **Like Post** | User likes content | `POST /api/posts/:id/like` | `{}` |
| **Submit Homework** | User uploads file | `POST /api/homework/submit` | `FormData` |
| **Book Consultation** | User books slot | `POST /api/bookings/create` | `{ slotId: string }` |

## 2. State Synchronization

When an action occurs on one platform, the state must propagate to others.

- **Real-time**: Use WebSockets (or Supabase Realtime) if supported.
- **On-Focus**: Refetch data when the app comes into foreground.

**Scenario**:
1. User **Likes** a post on Telegram Mini App.
2. `POST /api/posts/123/like` is called.
3. Database `likes_count` increments.
4. User opens Web App.
5. `GET /api/posts` fetches updated count.

## 3. Visual Consistency

While the *design* (CSS) may adapt to the platform (Material/Cupertino for mobile, Web styles for desktop), the **functional state** must be identical.

- If a button is **Disabled** on Web due to lack of funds, it must be **Disabled** on Telegram.
- Error messages (e.g., "Payment Failed") must convey the same information, even if the UI modal looks different.

## 4. Event Logging

Every button click that triggers an API call must be logged in `event_logs` with the platform source.

```sql
INSERT INTO event_logs (user_id, event_type, platform, metadata)
VALUES ('uuid', 'COURSE_START', 'telegram_mini_app', '{"course_id": "123"}');
```
