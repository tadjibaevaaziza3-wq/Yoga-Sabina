# 🚀 Quick Reference - Yoga Baxtli Men

## 📍 Main URLs

### Website (Desktop/Mobile Browser)
```
http://localhost:3000
http://192.168.0.169:3000  (network - for mobile)
```

### Telegram Mini App
```
http://localhost:3000/tma
http://192.168.0.169:3000/tma  (network - for Telegram bot config)
```

---

## 🌐 Key Pages

| Page | URL | Auth Required |
|------|-----|---------------|
| Homepage | `/uz` or `/ru` | ❌ No |
| Online Courses | `/uz/online-courses` | ❌ No |
| Offline Courses | `/uz/offline-courses` | ❌ No |
| Course Detail | `/uz/courses/[id]` | ❌ No (limited) |
| My Courses | `/uz/my-courses` | ✅ Yes |
| Admin Panel | `/admin/courses` | ✅ Yes (admin) |
| Telegram Mini App | `/tma` | ❌ No |

---

## 🔑 Quick Commands

### Start Development Server
```bash
cd c:\Users\user\Documents\yoga\baxtli-men
npm run dev
```

### Database Commands
```bash
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Run migrations
npx prisma studio          # Open database GUI
```

### Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Quick Tests

### Test 1: Browse Courses (No Login)
1. Open `http://localhost:3000/uz`
2. Click "Online Courses"
3. View course catalog
4. Click on any course
5. ✅ Should see course details + free lessons

### Test 2: Admin Panel
1. Open DevTools (F12) → Application → Cookies
2. Add cookie: `admin_session` = `test_admin_session`
3. Go to `http://localhost:3000/admin/courses`
4. ✅ Should see admin course management

### Test 3: Telegram Mini App
1. Get network IP: `ipconfig` (look for IPv4)
2. Configure Telegram bot with: `http://YOUR_IP:3000/tma`
3. Open bot in Telegram mobile app
4. ✅ Should see course catalog in Telegram

---

## 📊 API Quick Reference

### Public APIs
```
GET  /api/courses              # List active courses
GET  /api/courses/[id]         # Course details
```

### User APIs (Auth Required)
```
GET  /api/user/my-courses      # User's purchased courses
POST /api/user/accept-agreement # Accept user agreement
POST /api/video/get-signed-url  # Get video URL
```

### Admin APIs (admin_session Required)
```
GET    /api/admin/courses      # List all courses
POST   /api/admin/courses      # Create course
PUT    /api/admin/courses/[id] # Update course
DELETE /api/admin/courses/[id] # Delete course
POST   /api/admin/upload       # Upload file
```

---

## ⚙️ Environment Variables (Quick Setup)

Create/update `.env.local`:

```env
# Supabase (Required for auth & storage)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For video signed URLs

# Database
DATABASE_URL=your_postgres_url

# Optional (for production)
PAYME_MERCHANT_ID=
PAYME_SECRET_KEY=
TELEGRAM_BOT_TOKEN=
```

---

## 🐛 Common Issues

### Issue: "Database connection failed"
**Fix:** Check `DATABASE_URL` in `.env.local`

### Issue: "Video player not loading"
**Fix:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

### Issue: "Admin panel shows 403"
**Fix:** Set `admin_session` cookie in browser

### Issue: "TMA doesn't open in Telegram"
**Fix:** 
1. Check dev server is running
2. Use network IP (not localhost)
3. Ensure mobile is on same WiFi

---

## 📞 Need Help?

1. Check `DEVELOPMENT.md` for detailed docs
2. Check `TMA_README.md` for Telegram Mini App setup
3. Email: turaevahon@mail.ru

---

## ✅ Current Status

**Completed:**
- ✅ Database schema & migrations
- ✅ User authentication (Supabase)
- ✅ Secure video delivery with watermarks
- ✅ Admin panel (course management)
- ✅ User dashboard (catalog, details, my courses)
- ✅ Telegram Mini App integration
- ✅ Bilingual support (UZ/RU)

**Pending:**
- ⏳ Payme payment integration (need credentials)
- ⏳ Supabase Storage setup (need service role key)
- ⏳ Video progress tracking
- ⏳ Real-time chat & comments

---

**Server Status:** 🟢 Running on http://localhost:3000
**Last Updated:** 2026-02-05
