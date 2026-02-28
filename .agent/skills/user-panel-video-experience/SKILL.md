---
name: user-panel-video-experience
description: Video player and user panel experience standards for the Baxtli Men platform. Covers video playback UX, audio integration, completion tracking, thumbnails, and gamification. Use when modifying video player, lesson sidebar, user dashboard KPIs, or course learning interface.
---

# User Panel Video Experience Standards

> [!CAUTION]
> ## ⚠️ VIDEO PLAYBACK LOCATION (MANDATORY)
> - **Video playback exists ONLY in the User Panel** (web) — `src/app/[lang]/(user)/learn/[id]/`
> - **TMA does NOT have a video player** — never create `src/app/[lang]/tma/player/` directory
> - TMA is for course browsing, registration, and payment ONLY
> - After purchase in TMA, redirect users to User Panel to watch videos

## Video Watermark Requirements
- Every video MUST show a **dynamic floating watermark** using `DynamicWatermark.tsx`
- Watermark MUST display: `#userNumber` (unique, never-recycled ID), truncated userId, phone, date/time
- `userNumber` uses PostgreSQL `autoincrement()` — values are NEVER reused even after user deletion
- Watermark moves to random positions every 10 seconds to prevent screen recording

## Video Player Requirements (EnhancedVideoPlayer)

### 1. Time Display
- Video current time and total duration MUST always be visible in the controls bar
- Format: `MM:SS / MM:SS` (e.g., `3:45 / 20:00`)
- Located in the bottom controls bar, after play/volume controls

### 2. No Center Play Triangle
- Do NOT show the big center play/pause triangle overlay when video is paused
- The play/pause button in the bottom controls bar is sufficient
- The brief flash animation on tap (play/pause feedback) is acceptable
- Remove or hide the large overlay play button that appears when paused

### 3. Background Audio
- Audio controls MUST appear below the video player (not inside it)
- Audio MUST loop continuously until the video ends (`loop` attribute on audio element)
- Audio syncs with video play/pause/seek automatically
- Toggle button + volume slider for background music
- Audio stops when video ends

### 4. Cast to TV
- Cast/AirPlay button MUST be available in the video controls
- Uses the Remote Playback API for casting
- Button only shown when cast is supported by the browser

### 5. Video Completion & KPI
- When a video finishes playing (reaches end):
  1. Mark the lesson as completed in the database (`EnhancedVideoProgress`)
  2. Show a **congratulations celebration** modal to the user
  3. Update the KPI progress in the sidebar (completed count, percentage)
  4. Celebration should show: watched minutes, completed lessons count, XP earned
- The sidebar progress bar and lesson count must refresh immediately after completion

### 6. Lesson Thumbnails (YouTube-Style — STRICT RULE)

> [!CAUTION]
> ## ⚠️ THUMBNAIL RULE (NON-NEGOTIABLE)
> Every video lesson MUST show its **actual first frame as thumbnail** — like YouTube.
> - NO gradient placeholders, NO generic icons, NO same image for all videos
> - The user must be able to visually distinguish each lesson by its unique video thumbnail
> - This applies to BOTH the **User Panel** lesson sidebar AND the **Admin Panel** lesson list

#### How Thumbnails Work
- When a lesson has a video, we MUST show the first frame of THAT specific video
- Client-side canvas capture fails due to GCS CORS → use **server-side proxy** approach
- The `/api/video/thumbnail/[lessonId]` API proxies the GCS video, captures frame, returns JPEG
- Generated thumbnails are saved to the `Lesson.thumbnailUrl` field in the database

#### User Panel (Lesson Sidebar)
- `CourseLearningInterface.tsx` lesson items show `lesson.thumbnailUrl` as the thumbnail
- If `thumbnailUrl` is missing, call `/api/video/thumbnail/[lessonId]` to auto-generate
- Cache thumbnails in state to avoid re-fetching
- Thumbnail size: `~80x45px`, 16:9 ratio, `rounded-lg`, `object-cover`

#### Admin Panel (Lesson Management)
- Lesson list and edit forms show the video thumbnail next to each lesson
- Admin can click "Generate Thumbnail" to auto-capture from video
- Admin can also upload a custom thumbnail to override
- Store as `thumbnailUrl` on the `Lesson` model

## User Panel Dashboard (MyCourses)
- Course cards must show accurate progress percentage
- Show "days remaining" for subscription-based courses
- Progress updates immediately when returning from learn page
- Continue watching feature shows last watched lesson

## Files Reference
- Video Player: `src/components/video/EnhancedVideoPlayer.tsx`
- Dynamic Watermark: `src/components/video/DynamicWatermark.tsx`
- Learn Page: `src/app/[lang]/(user)/learn/[id]/page.tsx`
- Course Interface: `src/components/course/CourseLearningInterface.tsx`
- My Courses: `src/components/user/MyCourses.tsx`
- Dashboard Grid: `src/components/dashboard/MyCoursesGrid.tsx`
- Progress API: `src/app/api/user/my-courses/route.ts`
- Celebration: `src/components/video/VideoCompletionCelebration.tsx`
- Thumbnail API: `src/app/api/admin/video-thumbnail/route.ts`
