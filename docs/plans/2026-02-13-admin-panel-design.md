# Admin Panel & Cloud Migration Design

## User Review Required
> [!IMPORTANT]
> **Database Migration**: We are moving from SQLite to **Supabase PostgreSQL**. This involves a schema push and data migration. I will verify connectivity before executing.
> [!NOTE]
> **Video Security**: Using GCS Signed URLs + Client-side dynamic watermarking. Right-click and download will be disabled on the video container.

## Proposed Changes

### 1. Database Architecture (Postgres)
#### [MODIFY] [schema.prisma](file:///c:/Users/user/Documents/yoga/baxtli-men/prisma/schema.prisma)
- Change provider to `postgresql`.
- Add `EventLog` table for analytics tracking.
- Update `Profile` and `Purchase` tables to support more detailed tracking.

### 2. GCS Video System
#### [NEW] [gcs-config.ts](file:///c:/Users/user/Documents/yoga/baxtli-men/src/lib/gcs/config.ts)
- Initialize GCS client with the `ai-telco-forecast` service account.
#### [NEW] [signed-url/route.ts](file:///c:/Users/user/Documents/yoga/baxtli-men/src/app/api/videos/signed-url/route.ts)
- API endpoint to generate 30-min signed URLs.

### 3. Analytics & Tracking
#### [NEW] [tracking-provider.tsx](file:///c:/Users/user/Documents/yoga/baxtli-men/src/components/providers/tracking-provider.tsx)
- Global context to capture `app_open` and session time.
#### [NEW] [event-logs/route.ts](file:///c:/Users/user/Documents/yoga/baxtli-men/src/app/api/analytics/event-logs/route.ts)
- Backend endpoint for tracking client-side interactions.

### 4. Admin Dashboard (Modern UI)
#### [NEW] [AdminDashboard.tsx](file:///c:/Users/user/Documents/yoga/baxtli-men/src/app/[lang]/admin/dashboard/AdminDashboard.tsx)
- Re-architect the dashboard with Recharts, Shadcn/UI, and the requested "SaaS analytics" aesthetic (#114539 color palette).

### 5. Secure Video Player
#### [NEW] [SecurePlayer.tsx](file:///c:/Users/user/Documents/yoga/baxtli-men/src/components/video/SecurePlayer.tsx)
- HLS.js player with dynamic floating watermark and right-click protection.

## Verification Plan
1. **Connectivity**: Test GCS upload/download with a dummy file.
2. **Build**: Run `npm run build` to confirm Next.js 15 compatibility.
3. **Security**: Verify signed URLs expire after 30 mins.
4. **Analytics**: Confirm events appear in the `EventLog` table.
