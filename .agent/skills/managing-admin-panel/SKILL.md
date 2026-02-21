---
name: managing-admin-panel
description: Manages a premium Admin Panel with Google Cloud Storage integration and real-time analytics. Use when the user needs to upload secure video content, track user engagement, or view subscription metrics.
---

# Managing Admin Panel

## When to use this skill
- Implementing or modifying the Admin Dashboard.
- Configuring Google Cloud Storage (GCS) for secure video hosting.
- Setting up user event tracking and analytics visualization.
- Managing subscriptions and user roles.

## Workflow

### 1. GCS Video Pipeline
- [ ] **Upload**: Admin uploads video via the dashboard.
- [ ] **Storage**: Video is stored in the `antigravity-videos-aziza` bucket with server-side encryption.
- [ ] **Access**: Request a signed URL from GCS (default 30 min expiry).
- [ ] **Playback**: Render using `hls.js` or `Video.js` with client-side watermarking.

### 2. Analytics Tracking
- [ ] **Initialization**: Track `app_open` on root layout mount.
- [ ] **Interactions**: Capture `course_view`, `registration`, `subscription_purchase`.
- [ ] **Watch Progress**: Log heartbeats to `EnhancedVideoProgress` table.
- [ ] **Storage**: Save all logs to the `event_logs` table (PostgreSQL).

### 3. Subscription & Roles
- [ ] **Validation**: Check `subscription_status` on page load.
- [ ] **Locking**: Guard video routes with server-side middleware.
- [ ] **Admin Roles**: Enforce `Super Admin`, `Content Manager`, or `Analytics Viewer` permissions.

## Instructions

### GCS Signed URL Generation
Use `@google-cloud/storage` to generate restricted URLs:
```typescript
const options = {
  version: 'v4',
  action: 'read',
  expires: Date.now() + 30 * 60 * 1000, // 30 mins
};
const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);
```

### Dynamic Watermarking (Client-Side)
Overlay a semi-transparent `div` with `absolute` positioning. Use Framer Motion for slow movement:
```tsx
<motion.div
  animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
  transition={{ duration: 10, repeat: Infinity }}
  className="absolute pointer-events-none text-white/20 select-none"
>
  {userId} - {new Date().toLocaleTimeString()}
</motion.div>
```

### Database Schema Requirements
All analytics tables MUST use UUIDs for `id` and `user_id`.

## Resources
- [.agent/skills/managing-admin-panel/scripts/](file:///.agent/skills/managing-admin-panel/scripts/)
- [.agent/skills/managing-admin-panel/resources/dashboard-templates.md](file:///.agent/skills/managing-admin-panel/resources/dashboard-templates.md)
