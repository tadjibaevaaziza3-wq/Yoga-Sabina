# Telegram Mini App - Yoga Baxtli Men

## 🚀 Quick Start

### Local Development
```bash
npm run dev
```

**Access URL:**
- Local: `http://localhost:3000/tma`
- Network (for mobile testing): `http://192.168.0.169:3000/tma`

---

## 📱 Telegram Bot Setup

### 1. Create Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Follow instructions to create your bot
4. Save the **Bot Token**

### 2. Configure Mini App
1. Send `/newapp` to BotFather
2. Select your bot
3. Enter app title: **Yoga Baxtli Men**
4. Enter description
5. Upload app icon (512x512 PNG)
6. Upload GIF/video demo (optional)
7. Enter Web App URL:
   - **Development:** `http://192.168.0.169:3000/tma` (your network IP)
   - **Production:** `https://yourdomain.com/tma`

### 3. Test Mini App
1. Open your bot in Telegram
2. Click on the menu button (☰)
3. Select your Mini App
4. App should open in Telegram's in-app browser

---

## 🎨 Features

### Current Features
- ✅ Course catalog browsing
- ✅ Course details view
- ✅ Telegram user authentication
- ✅ Native Telegram UI integration
- ✅ Payment integration (Telegram Stars/Payme)

### Telegram-Specific Features
- **Telegram Auth:** Automatic user authentication via Telegram WebApp
- **Native UI:** Telegram theme colors and styling
- **Back Button:** Telegram back button integration
- **Main Button:** Telegram main button for actions
- **Haptic Feedback:** Vibration feedback on interactions

---

## 🔧 Technical Details

### Telegram WebApp SDK
The app uses Telegram's WebApp SDK for:
- User authentication
- Theme detection
- Native UI elements
- Payment processing

### File Structure
```
src/app/tma/
├── layout.tsx          # TMA-specific layout
├── page.tsx            # Main TMA page (course catalog)
└── payment-success/    # Payment success page
    └── page.tsx
```

### Key Components
- **Telegram Auth:** Uses `window.Telegram.WebApp.initDataUnsafe.user`
- **Theme:** Adapts to Telegram's light/dark theme
- **Navigation:** Uses Telegram's back button
- **Payments:** Integrates with Telegram Stars or external providers

---

## 🧪 Testing

### Local Testing (Desktop)
1. Open `http://localhost:3000/tma` in browser
2. Telegram WebApp SDK won't be available
3. App should show fallback UI

### Mobile Testing (Real Telegram)
1. Ensure dev server is running
2. Get your computer's network IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Configure bot with network URL: `http://YOUR_IP:3000/tma`
4. Open bot in Telegram mobile app
5. Launch Mini App

### Testing Checklist
- [ ] App loads in Telegram
- [ ] User authentication works
- [ ] Course catalog displays
- [ ] Course details open correctly
- [ ] Back button works
- [ ] Theme matches Telegram theme
- [ ] Payment flow works

---

## 🔐 Environment Variables

Add to `.env.local`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Payment (Payme)
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SECRET_KEY=your_secret_key

# Or use Telegram Stars (built-in)
TELEGRAM_PAYMENT_PROVIDER_TOKEN=your_provider_token
```

---

## 💳 Payment Integration

### Option 1: Telegram Stars (Recommended)
- Built into Telegram
- No external credentials needed
- Users pay with Telegram Stars
- Instant confirmation

### Option 2: Payme (Uzbekistan)
- Requires merchant account
- Supports UzCard, Humo
- Webhook integration needed

### Implementation
Payment flow is handled in:
- `/api/tma/create-invoice` - Create payment invoice
- `/api/tma/verify-payment` - Verify payment
- `/tma/payment-success` - Success redirect

---

## 🚀 Deployment

### Production Deployment

1. **Deploy to Vercel/Netlify:**
   ```bash
   npm run build
   vercel deploy
   ```

2. **Update Bot Configuration:**
   - Go to BotFather
   - Send `/myapps`
   - Select your app
   - Update Web App URL to production URL

3. **Configure Environment Variables:**
   - Add all required env vars to hosting platform
   - Ensure `TELEGRAM_BOT_TOKEN` is set

4. **Test Production:**
   - Open bot in Telegram
   - Launch Mini App
   - Verify all features work

---

## 📊 Analytics

### Telegram Analytics
Telegram provides built-in analytics:
1. Go to [@BotFather](https://t.me/BotFather)
2. Send `/myapps`
3. Select your app
4. View statistics

### Custom Analytics
You can add:
- Google Analytics
- Mixpanel
- Custom event tracking

---

## 🐛 Troubleshooting

### App doesn't load in Telegram
- Check if dev server is running
- Verify network URL is accessible from mobile
- Check firewall settings
- Ensure URL uses `http://` (not `https://` for local)

### User authentication fails
- Check if `window.Telegram.WebApp` is available
- Verify bot token is correct
- Check if user data is being passed

### Payment fails
- Verify payment credentials
- Check webhook URL is accessible
- Review payment provider logs

### Theme doesn't match Telegram
- Ensure Telegram WebApp SDK is loaded
- Check theme detection logic
- Verify CSS variables are set

---

## 📝 Development Tips

### Hot Reload
Changes to TMA pages will hot-reload automatically. Refresh the Mini App in Telegram to see changes.

### Debugging
1. Enable Telegram's debug mode:
   - Android: Tap version 7 times in Settings
   - iOS: Not available
2. Use Chrome DevTools for mobile debugging:
   - Connect phone via USB
   - Enable USB debugging
   - Open `chrome://inspect`

### Testing Payments
Use Telegram's test mode:
1. Create test bot with BotFather
2. Use test payment provider
3. No real money charged

---

## 🔗 Useful Links

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp Documentation](https://core.telegram.org/bots/webapps)
- [BotFather Commands](https://core.telegram.org/bots#botfather)
- [Telegram Payments](https://core.telegram.org/bots/payments)

---

## 📞 Support

For issues:
- Check Telegram bot logs
- Review browser console in Telegram
- Contact: turaevahon@mail.ru

---

**Last Updated:** 2026-02-05
**Status:** Development
