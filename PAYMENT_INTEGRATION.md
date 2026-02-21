# Payment Integration Guide

## Overview
The Baxtli Men platform supports three payment methods:
1. **Payme** - Uzbekistan's leading payment gateway
2. **Click** - Popular Uzbek payment system
3. **Mock** - For testing without real payments

All payment methods **automatically create subscriptions** when payment is successful.

---

## How It Works

### Payment Flow
1. User selects a course and clicks "Buy"
2. System creates a PENDING purchase record
3. User is redirected to payment provider (Payme/Click)
4. User completes payment
5. Payment provider sends webhook to our server
6. **Subscription is automatically created or extended**
7. User gains immediate access to the course

### Subscription Logic
- **New User**: Creates a new subscription with duration from `course.durationDays`
- **Existing Subscription**: Extends current subscription by adding `course.durationDays`
- **Default Duration**: 30 days if `course.durationDays` is not set

---

## API Endpoints

### Payme Integration

#### Checkout
**POST** `/api/payments/payme/checkout`
```json
{
  "userId": "user_id",
  "courseId": "course_id",
  "amount": 100000
}
```

#### Webhook (Payme → Server)
**POST** `/api/payments/payme/webhook`

Handles Payme methods:
- `CheckPerformTransaction` - Verify order exists
- `CreateTransaction` - Create transaction record
- `PerformTransaction` - **Creates subscription automatically**
- `CancelTransaction` - Mark as failed

### Click Integration

#### Checkout
**POST** `/api/payments/click/checkout`
```json
{
  "userId": "user_id",
  "courseId": "course_id",
  "amount": 100000
}
```

#### Webhook (Click → Server)
**POST** `/api/payments/click/webhook`

Handles Click actions:
- `action=0` (prepare) - Verify order
- `action=1` (complete) - **Creates subscription automatically**

### Mock Payment (Testing)

#### Verify Payment
**POST** `/api/payments/mock/verify`
```json
{
  "purchaseId": "purchase_id"
}
```

Simulates successful payment and **creates subscription automatically**.

---

## Environment Variables

Add these to your `.env.local` file:

### Payme Configuration
```env
PAYME_MERCHANT_ID=your_merchant_id
PAYME_SECRET_KEY=your_secret_key
```

### Click Configuration
```env
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_SECRET_KEY=your_secret_key
```

### App URL (for redirects)
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Testing

### Using Mock Payment (Development)

1. **Create a purchase**:
```bash
curl -X POST http://localhost:3000/api/payments/payme/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "courseId": "course_id",
    "amount": 100000
  }'
```

2. **Simulate successful payment**:
```bash
curl -X POST http://localhost:3000/api/payments/mock/verify \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseId": "purchase_id_from_step_1"
  }'
```

3. **Check subscription was created**:
```sql
SELECT * FROM Subscription WHERE userId = 'user_id';
```

### Testing Webhooks Locally

Use **ngrok** or **localtunnel** to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Use the ngrok URL for webhook configuration
# Example: https://abc123.ngrok.io/api/payments/payme/webhook
```

---

## Webhook Configuration

### Payme Merchant Panel
1. Login to Payme merchant dashboard
2. Go to Settings → Webhook URL
3. Set webhook URL: `https://yourdomain.com/api/payments/payme/webhook`
4. Save configuration

### Click Merchant Panel
1. Login to Click merchant dashboard
2. Go to Service Settings
3. Set webhook URL: `https://yourdomain.com/api/payments/click/webhook`
4. Set return URL: `https://yourdomain.com/payment/success`
5. Set cancel URL: `https://yourdomain.com/payment/cancel`

---

## Database Schema

### Purchase Model
```prisma
model Purchase {
  id              String         @id @default(cuid())
  userId          String
  courseId        String
  amount          Decimal
  status          PurchaseStatus @default(PENDING)
  provider        String         @default("PAYME")
  providerTxnId   String?        @unique
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

### Subscription Model
```prisma
model Subscription {
  id        String             @id @default(cuid())
  userId    String
  courseId  String
  startsAt  DateTime           @default(now())
  endsAt    DateTime
  status    SubscriptionStatus @default(ACTIVE)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
}
```

---

## Security Considerations

### Payme
- Webhook requests include transaction signatures
- Verify signatures using `PAYME_SECRET_KEY`
- Validate order amounts match expected values

### Click
- Webhook includes MD5 signature (`sign_string`)
- Verify signature: `MD5(click_trans_id + service_id + secret_key + merchant_trans_id + amount + action + sign_time)`
- Check signature matches to prevent fraud

### General
- Always verify purchase exists before processing
- Check purchase status to prevent double-processing
- Use HTTPS in production
- Store sensitive keys in environment variables
- Never expose secret keys in client-side code

---

## Troubleshooting

### Subscription Not Created

**Check:**
1. Payment webhook was received (check server logs)
2. Purchase status is `PAID` in database
3. Course has `durationDays` set (or defaults to 30)
4. No errors in webhook handler logs

**Debug:**
```bash
# Check purchase status
npx prisma studio
# Navigate to Purchase table and verify status

# Check server logs
npm run dev
# Look for "Payme webhook" or "Click webhook" logs
```

### Webhook Not Received

**Check:**
1. Webhook URL is correctly configured in merchant panel
2. Server is accessible from internet (use ngrok for local testing)
3. Firewall allows incoming requests
4. SSL certificate is valid (production)

### Duplicate Subscriptions

**Prevention:**
- Webhook handlers check for existing active subscriptions
- If found, extends instead of creating new
- Purchase status prevents double-processing

---

## Production Checklist

- [ ] Configure real Payme credentials
- [ ] Configure real Click credentials
- [ ] Set up webhook URLs in merchant panels
- [ ] Test with small real payment
- [ ] Verify subscription creation works
- [ ] Set up monitoring for failed webhooks
- [ ] Configure error notifications
- [ ] Test refund flow
- [ ] Document customer support procedures

---

## Support

For payment integration issues:
- **Payme**: support@paycom.uz
- **Click**: support@click.uz
- **Platform**: Check server logs and database records
