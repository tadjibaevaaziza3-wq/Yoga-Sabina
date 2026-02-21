# Yoga Baxtli Men - Development Guide

## 🚀 Quick Start

### Running the Application

```bash
cd c:\Users\user\Documents\yoga\baxtli-men
npm run dev
```

**URLs:**
- Website: http://localhost:3000
- Telegram Mini App: http://localhost:3000/tma
- Network (for mobile): http://192.168.0.169:3000

---

## 📱 Available Pages

### Public Pages (No Authentication Required)

#### 1. Homepage
- **URL:** `http://localhost:3000/uz` or `/ru`
- **Features:**
  - Hero section
  - Trainer section
  - About section
  - Programs section
  - Bilingual (Uzbek/Russian)

#### 2. Online Courses Catalog
- **URL:** `http://localhost:3000/uz/online-courses`
- **Features:**
  - Hero section with benefits
  - Course catalog with filters (All/Online/Offline)
  - Course cards with:
    - Cover image
    - Title and description
    - Price and duration
    - Lesson count
    - "Details" button

#### 3. Offline Courses Catalog
- **URL:** `http://localhost:3000/uz/offline-courses`
- **Features:**
  - Offline course listings
  - Location and schedule information
  - Consultation section

#### 4. Course Detail Page
- **URL:** `http://localhost:3000/uz/courses/[courseId]`
- **Features:**
  - Course information
  - Lessons sidebar with lock/unlock icons
  - Free lessons available to all
  - Purchase banner for non-subscribers
  - Video player integration (requires authentication)
  - User agreement modal before first video playback

### Protected Pages (Require Authentication)

#### 5. My Courses
- **URL:** `http://localhost:3000/uz/my-courses`
- **Features:**
  - List of purchased courses
  - Progress tracking (% completed)
  - Subscription expiry date
  - Days remaining warning
  - "Continue" or "Start" button
  - Redirects to login if not authenticated

### Admin Pages (Require admin_session Cookie)

#### 6. Admin Course Management
- **URL:** `http://localhost:3000/admin/courses`
- **Features:**
  - List all courses with filters
  - Create new course
  - Edit course
  - Delete course (with safety checks)
  - Toggle active/inactive status

---

## 🔑 Authentication

### User Authentication
Currently uses Supabase Auth. To test:
1. Create account via registration
2. Login to access protected pages

### Admin Authentication
Uses cookie-based authentication (`admin_session`).

**To set admin cookie manually (for testing):**
1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Add cookie:
   - Name: `admin_session`
   - Value: `test_admin_session`
   - Path: `/`

---

## 🎥 Video Player Features

### Security Features
- ✅ Time-limited signed URLs (30 min expiry)
- ✅ Dynamic watermarks (user ID + email + timestamp)
- ✅ Rate limiting (5 requests/minute)
- ✅ User agreement acceptance required
- ✅ Subscription verification
- ✅ Access logging

### To Test Video Player:
1. Login as user
2. Purchase a course (or have active subscription)
3. Accept user agreement
4. Navigate to course detail page
5. Click on a lesson
6. Video player will load with watermark overlay

**Note:** Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for signed URLs to work.

---

## 📊 API Endpoints

### Public APIs

#### Courses
- `GET /api/courses` - List all active courses
  - Query params: `?type=ONLINE` or `?type=OFFLINE`
- `GET /api/courses/[id]` - Get course details
  - Returns free lessons for public
  - Returns all lessons for subscribers

### User APIs (Require Authentication)

#### My Courses
- `GET /api/user/my-courses` - Get user's purchased courses with progress

#### User Agreement
- `POST /api/user/accept-agreement` - Accept user agreement
- `GET /api/user/accept-agreement` - Check agreement status

#### Video Access
- `POST /api/video/get-signed-url` - Get signed URL for video
  - Body: `{ assetId, lessonId }`
  - Returns: `{ signedUrl, expiresAt, watermarkData }`

### Admin APIs (Require admin_session)

#### Courses
- `GET /api/admin/courses` - List all courses
  - Query params: `?type=ONLINE&isActive=true`
- `POST /api/admin/courses` - Create course
- `GET /api/admin/courses/[id]` - Get course details
- `PUT /api/admin/courses/[id]` - Update course
- `DELETE /api/admin/courses/[id]` - Delete course

#### Lessons
- `POST /api/admin/lessons` - Create lesson
- `PUT /api/admin/lessons/[id]` - Update lesson
- `DELETE /api/admin/lessons/[id]` - Delete lesson

#### File Upload
- `POST /api/admin/upload` - Upload file to Supabase Storage
  - Form data: `file`, `bucket` (videos/assets), `path`
- `DELETE /api/admin/upload` - Delete file from storage

---

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Key Models
- `User` - User accounts
- `Course` - Courses (online/offline)
- `Lesson` - Course lessons
- `Asset` - Video/file assets
- `Subscription` - User course subscriptions
- `UserAgreement` - User agreement acceptance logs
- `VideoAccessLog` - Video access audit trail
- `SignedUrlCache` - Active signed URLs

---

## ⚙️ Environment Variables

### Required for Full Functionality

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for video signed URLs

# Database
DATABASE_URL=your_database_url

# Security
USER_AGREEMENT_VERSION=1.0
SIGNED_URL_EXPIRY_MINUTES=30
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MINUTES=1

# Brand
NEXT_PUBLIC_BRAND_NAME="Yoga Baxtli Men"
NEXT_PUBLIC_SUPPORT_EMAIL="turaevahon@mail.ru"

# Payment (Not yet configured)
PAYME_MERCHANT_ID=
PAYME_SECRET_KEY=
```

---

## 🧪 Testing Checklist

### User Flow Testing

- [ ] **Homepage**
  - [ ] Page loads correctly
  - [ ] All sections visible
  - [ ] Language switcher works (uz/ru)

- [ ] **Course Catalog**
  - [ ] Courses display in grid
  - [ ] Filters work (All/Online/Offline)
  - [ ] Course cards show correct info
  - [ ] Click on course navigates to detail page

- [ ] **Course Detail**
  - [ ] Course info displays
  - [ ] Lessons sidebar shows
  - [ ] Free lessons are unlocked
  - [ ] Paid lessons show lock icon
  - [ ] Purchase banner appears for non-subscribers

- [ ] **Video Player**
  - [ ] User agreement modal appears (first time)
  - [ ] Video loads after agreement
  - [ ] Watermark is visible and animated
  - [ ] Playback controls work
  - [ ] Progress is saved

- [ ] **My Courses**
  - [ ] Redirects to login if not authenticated
  - [ ] Shows purchased courses
  - [ ] Progress bars display correctly
  - [ ] Days remaining shown
  - [ ] "Continue" button works

### Admin Flow Testing

- [ ] **Admin Login**
  - [ ] Set admin_session cookie
  - [ ] Access /admin/courses

- [ ] **Course Management**
  - [ ] List courses with filters
  - [ ] Create new course
  - [ ] Edit course details
  - [ ] Toggle active/inactive
  - [ ] Delete course (checks for active subscriptions)

- [ ] **File Upload**
  - [ ] Upload video file
  - [ ] Upload PDF/image
  - [ ] Files appear in Supabase Storage

---

## 🐛 Known Issues & Limitations

1. **Payment System Not Configured**
   - Payme credentials not set
   - Purchase flow not functional yet

2. **Supabase Storage Setup Required**
   - Need to create `videos` and `assets` buckets
   - Need to configure RLS policies
   - Need `SUPABASE_SERVICE_ROLE_KEY` for signed URLs

3. **Progress Tracking Not Implemented**
   - Video progress is not saved to database yet
   - "My Courses" shows 0% progress for all courses

4. **Rate Limiting**
   - Currently in-memory (resets on server restart)
   - Should use Redis for production

---

## 📝 Next Steps

### High Priority
1. Configure Supabase Storage buckets and RLS
2. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
3. Implement video progress tracking
4. Configure Payme payment integration

### Medium Priority
5. Add real-time chat and comments
6. Implement lesson reordering in admin
7. Add bulk upload functionality
8. Create admin dashboard with analytics

### Low Priority
9. Add email notifications
10. Implement AI assistant (FAQ-based)
11. Add video transcoding pipeline
12. Implement DRM for high-value content

---

## 🎯 Quick Test Scenarios

### Scenario 1: Browse Courses (No Auth)
1. Go to `http://localhost:3000/uz`
2. Click "Online Courses" in navigation
3. Browse course catalog
4. Click on a course
5. See course details and free lessons

### Scenario 2: Watch Free Lesson
1. Navigate to a course detail page
2. Click on a free lesson
3. Accept user agreement (first time)
4. Watch video with watermark

### Scenario 3: Admin Create Course
1. Set admin_session cookie
2. Go to `/admin/courses`
3. Click "Create Course"
4. Fill in course details
5. Save course
6. Verify course appears in catalog

---

## 📞 Support

For issues or questions:
- Email: turaevahon@mail.ru
- Check logs in terminal where `npm run dev` is running
- Check browser console for client-side errors

---

**Last Updated:** 2026-02-05
**Version:** 1.0.0
**Status:** Development
