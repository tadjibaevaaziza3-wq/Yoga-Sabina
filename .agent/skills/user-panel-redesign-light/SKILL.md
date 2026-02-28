---
name: user-panel-redesign-light
description: Use this skill when redesigning the User Panel. Applies an ultra-premium LIGHT MODE experience. Uses ONLY White and Dark Green colors. Implements gamification, advanced video protection, and specific dashboard/profile layouts without altering the backend or subscription logic.
---

# User Panel Redesign (Ultra-Premium Light Mode)

This skill dictates the design rules and structural requirements for redesigning the user panel into an ultra-premium light mode experience.

## Core Directives

1.  **Light Mode Only**: Remove all dark mode styles completely.
2.  **Color Palette**: Use ONLY White (`#FFFFFF` base) and Dark Green (brand logo green as primary accent). Use light green shades for hover states. **No beige, no gold, no pastel tones.**
3.  **Backend & Logic**: Do NOT rebuild the backend. Keep current subscription logic intact. Upgrade UX, gamification, and video security structurally and visually.

## 1) Design Style (White + Dark Green Only)

*   **Background**: Pure white.
*   **Accents**: Dark green.
*   **Hover States**: Light green shades.
*   **Layout**: Very clean minimalist layout.
*   **Typography**: Elegant modern typography.
*   **Elements**: Soft subtle shadows, rounded premium cards.
*   **Spacing**: Airy spacing.
*   **Animations**: Smooth micro-animations.
*   **Aesthetic Goal**: Must feel premium, clean, professional, trustworthy, and like a private wellness platform.

## 2) Profile Hero Section

This section sits at the top of the dashboard.

**Left Side:**
*   Large circular profile photo (uploadable).
*   Elegant dark green level badge.
*   Soft animated streak indicator (green pulse effect).
*   Subscription status badge (green if active, light grey if inactive).

**Right Side:**
*   Motivational dynamic message.
*   Animated XP progress ring (dark green).
*   Level indicator.

*Note: The profile photo must also be used in AI chat, comments, and the activity feed.*

## 3) Gamification (Elegant, Not Gaming Style)

**XP System:**
Earn XP for:
*   Completing videos
*   Daily login
*   Maintaining streak
*   Completing courses

**Levels:**
*   Levels 1–50.
*   Subtle dark green glow around the badge when a level increases.

**Badges:**
*   First Practice, 7 Day Consistency, 30 Day Consistency, Course Completion, Body Progress Milestone, Early Morning Discipline.
*   Must use white background with dark green iconography.

**Streak:**
*   Dark green progress bar.
*   Gentle encouragement message if the streak breaks.

## 4) Dashboard Structure

Adopt a vertical layout with the following sections in order:
1.  **Continue Watching**
2.  **My Active Course**
3.  **Recommended For You**
4.  **Achievements**
5.  **Body Metrics Summary**
6.  **Large Training Calendar**: Full width, dark green highlight for training days, clickable dates, shows minutes trained per day, light green hover effect.

## 5) Courses Page

Utilize a clean white grid layout.

**Course Card:**
*   White card with soft shadow.
*   Dark green title.
*   Duration, Level, Short description.
*   Tags (outlined in dark green).

**Locked Preview Videos:**
*   Blurred preview.
*   Dark green "Premium" badge.
*   CTA button: "Subscribe to Unlock" (solid dark green button).

## 6) Video Player (Premium White + Green)

**Main Area:**
*   Large clean video player.

**Side Panel:**
*   Scrollable video list.
*   Search bar.
*   Filter by tags.
*   Dark green progress indicator.

**Below Video:**
*   Like (green when active), Save, Comment, Add to Favorites.

**Required Features:**
*   Full screen.
*   Cast to TV (Remote Playback API — Chromecast/AirPlay).
*   Resume playback.
*   Autoplay next.
*   **Background Audio**: If admin attached audio to a lesson, show a looping audio control bar below the video (not as a file). Audio loops for the entire video duration even if shorter. User can toggle on/off and adjust volume. Defaults to 30% volume.
*   **Video Completion Celebration**: When user finishes watching a video (90%+ watched), show a luxury celebration modal with confetti, motivational messages (UZ/RU), XP earned, watch time, completed count, streak, and a "Next Lesson" button. Must feel premium and encouraging.
*   **Auto-Thumbnail**: If admin didn't add a cover photo for the lesson, show the first frame of the video as thumbnail (like YouTube). The video player auto-generates a poster from the video data.

## 7) User Panel Isolation

*   **No App Navigation**: The user panel must NOT show the main app header, footer, or top menu. It is a private panel, not the main site.
*   **Sidebar Only**: Navigation is handled by the `UserSidebar` component — no duplicate navigation elements.
*   **All Routes Covered**: `/account`, `/all-courses`, `/my-courses`, `/learn`, `/profile`, `/activity`, `/chat`, `/settings`, `/kpi` — all render inside the user panel layout without app chrome.

## 8) Advanced Video Protection

*   **Dynamic moving watermark**: Displays User ID, Email, Date, Time. Semi-transparent dark green text, changes position periodically, visible in full screen.
*   **Security Restrictions**: Disable right-click, prevent download, blur video when tab is inactive, prevent multi-device streaming.

## 9) My Activity Page

**Statistics to Show:**
*   Courses enrolled, Courses completed.
*   Total XP, Level, Streak.
*   Total watch time.
*   Saved videos, Favorite videos.

**UI Component**: Add a clean milestone timeline in a dark green accent.

## 10) Profile Settings

User capabilities:
*   Upload photo
*   Change password
*   Update phone
*   View subscription
*   Manage devices
*   Logout

## 11) Dashboard Statistics

*   **Data Source**: Dashboard stats (videos watched, watch time, XP, streak) must come from `enhancedVideoProgress` table, NOT the legacy `progress` or `profile.totalYogaTime` fields.
*   **Real-Time**: Stats update when the user navigates back to the dashboard after watching.
