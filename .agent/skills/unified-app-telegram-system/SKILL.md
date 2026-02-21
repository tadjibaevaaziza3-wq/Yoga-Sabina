---
name: unified-app-telegram-system
description: Defines the architecture for ensuring identical functionality and single backend logic across Web, Mobile, and Telegram Mini App platforms.
---

# Unified App-Telegram System

This skill enforces a **Single Source of Truth** architecture where the Web Application, Mobile App, and Telegram Mini App are treated as equal frontend interfaces consuming the same backend logic.

## 1. Core Principles

### Single Backend Architecture
- **One Database**: All platforms read/write to the same database.
- **One API**: All platforms consume the same REST/GraphQL endpoints.
- **No Platform-Specific Logic**: Business rules (subscription checks, content access) exist ONLY in the backend.

### Telegram Mini App as a Frontend
The Telegram Mini App is not a separate bot or system. It is a **web view** that:
1.  **Auto-Registers**: Creates a user account using Telegram credentials if one doesn't exist.
2.  **Auto-Logins**: Authenticates existing users silently.
3.  **Syncs Session**: Maintains the same user session state as the main web app.

### Unified Action Handling
Every interactive element (button, form, toggle) must trigger the exact same API endpoint regardless of the platform.
- **Example**: Clicking "Buy Course" in Telegram sends the same `POST /api/purchase` request as the Web App.

## 2. Resources

- **[Unified Logic](./resources/unified-logic.md)**: Architecture rules for database, content, and API consistency.
- **[Telegram Auth](./resources/telegram-auth.md)**: Flows for seamless Telegram authentication and user creation.
- **[Button Synchronization](./resources/button-synchronization.md)**: mapping UI actions to backend endpoints.
- **[Routing System](./resources/routing-system.md)**: Deep linking and navigation rules.
- **[Database Schema](./resources/database-schema.md)**: Schema requirements to support multi-platform users.

## 3. Implementation Checklist

- [ ] **Verify Database**: Ensure `User` table supports `telegram_id` and `registration_source`.
- [ ] **Auth Middleware**: Implement validation for Telegram `initData`.
- [ ] **API Consistency**: Audit all endpoints to ensure they are platform-agnostic.
- [ ] **Deep Linking**: Configure routing to handle `t.me/bot?start=param` redirects.
- [ ] **Logging**: Ensure `event_logs` capture the `platform` source (web/app/telegram).
