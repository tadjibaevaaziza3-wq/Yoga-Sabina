# Design Doc: Baxtli Men Luxury Remake

## 1. Goal
Unify the visual and verbal experience of the Baxtli Men platform across the main website, TMA mobile app, and Admin panel. Transform the current experience into a **Luxury Therapeutic Yoga Experience** that reflects **Sabina Polatova's** expertise and authority.

## 2. Visual Identity

### Color Palette
- **Primary**: #114539 (Deep Emerald) - used for text, primary buttons, and deep backgrounds.
- **Background**: #f6f9fe (Soft Neutral) - used as the base background for ALL platforms (Web, TMA, Admin).
- **Luxury Accent**: #d8cfc4 (Champagne Beige) - used for soft highlights, border accents, and subtle status indications.
- **Muted Neutrals**: Soft stone and sand tones for secondary elements.

### Typography
- **Headings**: `Playfair Display` (Elegant Serif). Style: Editorial, bold, Title Case.
- **Body**: `Inter` (Modern Sans-Serif). Style: Clean, high readability, sentence case.

### UI Components
- **Border Radius**: 1.25rem (20px) for cards, 1.5rem (24px) for buttons.
- **Shadows**: Soft, layered shadows (`shadow-soft`) to create depth without harshness.
- **Whitespace**: Large breathing sections and expansive vertical rhythm.

## 3. Platform Remakes

### Main Web App
- **Hero Section**: Cinematic full-width layout featuring the new trainer portrait.
- **Editorial Content**: Transform services and about pages into editorial-style layouts with strong typography and high-quality imagery.
- **Navigation**: Clean, minimalist header with refined transitions.

### Telegram Mini App (TMA)
- **Transition**: Move from dark-only layouts to the luxury light neutral theme.
- **Experience**: Focus on "Calm Authority." Use soft rounded corners and clean forms.
- **Logo**: Primary use of the new Emerald logo on light backgrounds.

### Admin Panel
- **Dashboard**: Modernize with clean typography and airy grids.
- **Data Display**: Spacious tables with soft borders and refined status badges.
- **Consistency**: Complete removal of the legacy dark theme in favor of the unified luxury identity.

## 4. Image Strategy
- **New Logo**: Use the provided logo (Photo 1) as the primary branding asset.
- **New Trainer Portrait**: Use the provided portrait (Photo 2) as the marquee image for landing and profile sections.
- **Legacy Photos**: Ensure existing course and service photos are displayed within the new premium containers (rounded cards with soft shadows).

## 5. Technical Implementation
- **Tokens**: Centralize all values in `globals.css` using Tailwind v4 theme variables.
- **Components**: Update custom UI primitives (`Button`, `Card`, `Container`) to match the new tokens.
- **Responsiveness**: Ensure the editorial feel scales from mobile TMA to desktop browsers.
