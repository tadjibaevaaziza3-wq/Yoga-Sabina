# Admin Permissions Matrix

## Role Hierarchy

| Capability | SUPER_ADMIN | ADMIN (configurable) |
|---|:---:|:---:|
| Create/delete admins | ✅ | ❌ |
| Assign permissions | ✅ | ❌ |
| View all logs | ✅ | Via `logs.view` |
| View financial data | ✅ | Via `payments.view` |
| Manage subscriptions | ✅ | Via `subscriptions.*` |
| Manage automation | ✅ | Via `automation.*` |
| Grant subscription | ✅ | Via `subscriptions.grant` |
| Edit user | ✅ | Via `users.edit` |
| Delete user | ✅ | Via `users.delete` |
| Send messages | ✅ | Via `messages.*` |
| View KPIs | ✅ | Via `analytics.view` |
| Upload courses | ✅ | Via `courses.create` |
| Verify payments | ✅ | Via `payments.verify` |
| Export data | ✅ | Via `analytics.export` |

## Permission Keys

```
users.view       - View user list and details
users.edit       - Edit user profiles, reset passwords
users.delete     - Delete users
users.create     - Create new users

subscriptions.view   - View subscription list
subscriptions.grant  - Manually grant subscriptions
subscriptions.manage - Edit/cancel subscriptions

courses.view     - View course list
courses.create   - Create new courses
courses.edit     - Edit existing courses
courses.delete   - Delete courses

payments.view    - View payment/revenue reports
payments.verify  - Verify manual bank payments

leads.view       - View lead/non-subscriber list
leads.message    - Send messages to leads

analytics.view   - View KPI dashboard
analytics.export - Download reports/data

automation.view    - View automation rules
automation.manage  - Create/edit/delete triggers

messages.send      - Send individual messages
messages.broadcast - Send bulk broadcasts

settings.view  - View system settings
settings.edit  - Modify system settings

logs.view - View admin action logs
```

## Middleware Pattern

```typescript
// src/lib/auth/admin-middleware.ts
import { getAdminFromToken } from './server'
import { NextResponse } from 'next/server'

export async function requirePermission(req: Request, permission: string) {
  const admin = await getAdminFromToken(req)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (admin.role !== 'SUPER_ADMIN' && !(admin.permissions as string[]).includes(permission)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return admin
}
```
