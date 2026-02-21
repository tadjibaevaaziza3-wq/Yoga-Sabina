---
name: tma-user-journey-standard
description: Use when implementing or modifying the Telegram Mini App (TMA) user flow, including introduction, registration, course selection, and payment processing for the Baxtli Men platform.
---

# TMA User Journey Standard

## Overview
This skill defines the mandatory sequence and features for the Telegram Mini App (TMA). It ensures a premium onboarding experience, secure registration, and a frictionless path to course subscription.

## Core Journey Flow

### 1. Trainer Introduction (Onboarding)
- **Visuals**: Hero photo of Sabina Polatova and high-quality intro video.
- **Brand**: Visible "Baxtli Men" logo.
- **Localization**: Immediate option to toggle between Russian (RU) and Uzbek (UZB).
- **Text**: Professional biography emphasizing Sabina's 7+ years of yoga therapy expertise.

### 2. Registration Flow
User must register to proceed to content.
- **Fields**: Name, Phone Number, Location.
- **Personalization**: "Issue/Pain Point" (what brought them to yoga).
- **Backend Sync**: Data must be saved in the database and appear in the Admin Panel's user/leads section.

### 3. Service Categories
Post-registration hub options:
- **Online Courses**: Access to digital video programs.
- **Offline Classes**: Information on physical studio sessions.
- **Contact Manager**: Direct link to support/administration.

### 4. Course Exploration
- **Source of Truth**: Data (titles, descriptions, photos, videos) must be fetched from the Admin Panel's course management system.
- **Course Detail**: Comprehensive overview with an "Buy Course" or "Go Back" action.

### 5. Payment & Subscription
- **Payment Methods**: 
    - Automated: **Click**, **Payme** (automatic activation upon success).
    - Manual: **Bank Transfer** (User sends payment screenshot).
- **Activation**:
    - Automatic activation for Click/Payme.
    - Admin approval required for bank transfer screenshots.
- **Closing the Loop**: User receives a message/link via the bot in TMA to access their User Panel or App.

## Implementation Details

### UI Aesthetics
- Follow #114539 (Deep Forest Green) and #f6f9fe (Soft Ice Blue) palette.
- Use Glassmorphism for cards and overlays.
- Smooth transitions for step progression.

### API Integration
- Use `POST /api/tma/register` for user data collection.
- Use `GET /api/courses` to populate service lists.
- Use `POST /api/tma/payment` for initial payment intent.

## Common Mistakes
- Skipping the "Issue" field in registration (reduces AI personalization potential).
- Hardcoding course data instead of fetching from Admin Panel.
- Missing the language toggle on the intro screen.
- Auto-approving bank transfers without screenshot verification.
