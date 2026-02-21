---
name: tgu-user-management
description: Use when managing or implementing enterprise-level administrative tracking, payment verification, and subscription control for TMI/Application users.
---

# TGU User Management

## Overview
This skill defines the mandatory, backend-controlled system for tracking, storing, monitoring, and managing all users registered via TMI / Application. It ensures enterprise-level visibility within the Admin Panel under the **"TGU Users"** section.

## Core Principles
- **Mandatory Visibility**: Every user registered must be visible in the Admin Panel.
- **Total Behavioral Logging**: All user interactions (logins, video views, duration) must be recorded.
- **Payment-to-Subscription Integrity**: Subscriptions must be automatically or manually activated based on verified payment status.
- **Dynamic Access Control**: Subscription expiration must automatically lock premium content.

## When to Use
- Implementing user registration or profile updates.
- Building behavior tracking systems (video progress, session logs).
- Developing payment gateways (Click, Apple, Manual).
- Configuring administrative dashboards for user management.
- Setting up subscription reminder and expiration logic.

## Resource Directory
This skill relies on detailed technical documentation for specific subsystems:

- [User Tracking](file:///c:/Users/user/Documents/yoga/baxtli-men/.agent/skills/tgu-user-management/resources/user-tracking.md): Data storage and behavioral logging specs.
- [Payment Management](file:///c:/Users/user/Documents/yoga/baxtli-men/.agent/skills/tgu-user-management/resources/payment-management.md): Verification flows for Click, Manual, and Apple payments.
- [Subscription Control](file:///c:/Users/user/Documents/yoga/baxtli-men/.agent/skills/tgu-user-management/resources/subscription-control.md): Monitoring active users and automatic reminders.
- [Database Schema](file:///c:/Users/user/Documents/yoga/baxtli-men/.agent/skills/tgu-user-management/resources/database-schema.md): Enterprise-level table definitions.

## System Rules
1. **No Hidden Users**: All users must appear in "TGU Users".
2. **Atomic Logs**: Every login, video open, and duration chunk must be recorded in `event_logs`.
3. **Verified Access**: No subscription activation without payment verification (webhook or admin approval).
4. **Subscription Locking**: Access must be revoked immediately upon expiration.
5. **Admin Filters**: Full filtering by region, payment status, and activity level is mandatory.
