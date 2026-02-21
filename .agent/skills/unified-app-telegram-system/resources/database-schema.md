# Database Schema Requirements

To support the Unified System, the database must track user identity across platforms and log all activities.

## 1. User Table Extensions

```prisma
model User {
  id                  String   @id @default(uuid())
  
  // Basic Info
  firstName           String?
  lastName            String?
  phone               String?  @unique
  role                UserRole @default(USER)
  
  // Telegram Identity
  telegramId          BigInt?  @unique // Stored as BigInt to handle large IDs
  telegramUsername    String?
  telegramPhotoUrl    String?
  
  // System Metadata
  registrationSource  RegistrationSource @default(WEB) // WEB, TELEGRAM, MOBILE_APP
  region              Region             @default(UZ)
  language            String             @default("uz")
  
  // Timestamps
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relations
  sessions            Session[]
  activityLogs        EventLog[]
}

enum RegistrationSource {
  WEB
  TELEGRAM
  MOBILE_APP
}
```

## 2. Session Management

(Optional: Only if using database-backed sessions instead of stateless JWTs)

```prisma
model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  token        String   @unique
  platform     RegistrationSource // WEB, TELEGRAM, etc.
  deviceInfo   String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}
```

## 3. Event Logging (Unified Tracking)

```prisma
model EventLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  eventType   String   // e.g., 'LOGIN', 'PURCHASE', 'COURSE_START'
  platform    RegistrationSource // Track where the action happened
  
  metadata    Json?    // Flexible storage for details (course_id, amount, etc.)
  
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
}
```

## 4. Migration Strategy

1.  **Add Fields**: Add `telegramId`, `registrationSource` to `User`.
2.  **Create Tables**: Create `EventLog` table.
3.  **Indexes**: Index `telegramId` for fast lookups during auth.
