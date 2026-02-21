# Technology Stack & Implementation Rules

All technical decisions must serve the "Baxtli Men" luxury aesthetic and therapeutic mission.

## Core Stack
- **Framework**: React with TypeScript.
- **Styling**: Tailwind CSS ONLY. No external CSS files.
- **Components**: shadcn/ui (customized to brand tokens).
- **Icons**: Lucide React.

## Luxury UI Implementation Rules
- **Semantic Tokens**: Strictly use Tailwind configuration that maps to `design-tokens.json`. No hardcoded hex values in code.
- **Editorial Layout**: 
    - Use `max-w-6xl` containers for hero sections and main content.
    - Maintain strong vertical rhythm and generous white space.
- **Subtle Motion**:
    - Use `duration-200` max for transitions.
    - Prefer soft opacity fades over aggressive slides.
    - No flashy or distracting hover effects.
- **Dark Mode**: Must feel like a "Deep Emerald Studio at Night" (using `#0d2b24` as base background).

## Component Guidelines

### Forms
- Labels must always be placed above inputs.
- Use `gap-6` minimum between form elements.
- Input fields must have `rounded-xl` and soft borders.
- Active states should use the Champagne accent or Primary default.

### Admin Panel
- Layout should use a structured grid.
- Tables must be airy, avoiding data density overload.
- Dashboards must be calm, prioritizing readability over complexity.

## Forbidden Practices
- **No** Bootstrap or jQuery.
- **No** sharp edges (everything must be refined and rounded).
- **No** neon or overly saturated colors.
- **No** gradient-heavy backgrounds (prefer solid colors or very soft, organic overlays).
- **No** fitness-style UI (avoid aggressive counters, high-energy badges, and "gym" aesthetics).
