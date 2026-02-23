# Admin API Routes Specification

## Authentication

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/admin/login` | Public | Login with username/password |
| POST | `/api/admin/logout` | Authenticated | Clear session |
| GET | `/api/admin/me` | Authenticated | Get current admin info |

## Admin Management (SUPER_ADMIN only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/admins` | List all admins |
| POST | `/api/admin/admins` | Create new admin |
| GET | `/api/admin/admins/[id]` | Get admin details |
| PATCH | `/api/admin/admins/[id]` | Update admin (role, permissions, status) |
| DELETE | `/api/admin/admins/[id]` | Deactivate admin |

## Admin Profile

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| PATCH | `/api/admin/profile` | Authenticated | Update own profile (name, avatar) |
| POST | `/api/admin/profile/password` | Authenticated | Change own password |
| GET | `/api/admin/profile/activity` | Authenticated | Get own action log |

## KPI Dashboard

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/admin/analytics` | `analytics.view` | KPI summary with date filters |
| GET | `/api/admin/analytics/charts` | `analytics.view` | Chart data (registrations, purchases, revenue per day) |
| GET | `/api/admin/analytics/realtime` | `analytics.view` | Online users, active sessions |

## User Management

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/admin/users` | `users.view` | List/filter/search users |
| POST | `/api/admin/users` | `users.create` | Create user |
| PATCH | `/api/admin/users/[id]` | `users.edit` | Edit user, reset password |
| DELETE | `/api/admin/users/[id]` | `users.delete` | Delete user |

## Lead Management

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/admin/leads` | `leads.view` | List leads with filters |
| POST | `/api/admin/leads/broadcast` | `leads.message` | Send message to leads |
| GET | `/api/admin/leads/export` | `analytics.export` | Export lead data |

## Automation

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/admin/marketing/triggers` | `automation.view` | List triggers |
| POST | `/api/admin/marketing/triggers` | `automation.manage` | Create trigger |
| PATCH | `/api/admin/marketing/triggers/[id]` | `automation.manage` | Update trigger |
| DELETE | `/api/admin/marketing/triggers/[id]` | `automation.manage` | Delete trigger |

## Financial

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/admin/purchases` | `payments.view` | Revenue reports with date filters |
| GET | `/api/admin/orders` | `payments.view` | Order list |
| PATCH | `/api/admin/orders/[id]/verify` | `payments.verify` | Verify manual payment |

## Data Export

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/admin/users?export=csv` | `analytics.export` | Download user list |
| GET | `/api/admin/leads/export` | `analytics.export` | Download lead list |
| GET | `/api/admin/purchases?export=csv` | `analytics.export` | Download revenue report |
