# Design System: CapstoneFlow Precision Work OS

## 1. Visual Theme & Atmosphere
- **Atmosphere Spectrum**: Cockpit Dense meets Apple Studio Precision (Density: 6/10, Variance: 6/10, Motion: 7/10).
- **Aesthetic Direction**: High-contrast, dark-mode default obsidian workspace with subtle specular hairline borders, crisp typography, and restrained emerald green status accents.
- **Design Philosophy**: Utility-first academic engineering workspace. No frivolous decorative noise, no fake numbers, and no neon gradients. Every element exists to provide situational awareness for capstone milestones and defense readiness.

---

## 2. Color Palette & Roles

### Dark Theme (Default)
- **Canvas Base (`--bg-app`)**: `#08090C` (Deep obsidian charcoal; never pure `#000000`)
- **Sidebar Surface (`--bg-sidebar`)**: `rgba(14, 17, 24, 0.84)` (Translucent blurred dark slate)
- **Primary Card Surface (`--bg-card`)**: `rgba(20, 24, 34, 0.72)` (Elevated glass container)
- **Elevated Surface (`--bg-elevated`)**: `rgba(26, 32, 46, 0.80)` (High-elevation popover and inputs)
- **Specular Hairline (`--border-card`)**: `rgba(255, 255, 255, 0.10)` (Top specular edge highlight)
- **Subtle Divider (`--border-subtle`)**: `rgba(255, 255, 255, 0.06)` (Internal separators)
- **Primary Accent (`--primary`)**: `#30D158` (Apple Precision Emerald, saturation < 80%)
- **Primary Hover (`--primary-hover`)**: `#28C34E` (Deepened emerald active state)
- **Primary Light (`--primary-light`)**: `rgba(48, 209, 88, 0.12)` (Translucent tag tint)
- **Primary Text (`--text-primary`)**: `#F7F8F9` (High-contrast off-white)
- **Secondary Text (`--text-secondary`)**: `#8A8F98` (Balanced readable slate)
- **Muted Metadata (`--text-muted`)**: `#575B63` (Technical annotations and labels)

### Light Theme
- **Canvas Light (`--bg-app`)**: `#F5F6F8` (Crisp neutral platinum)
- **Card Surface (`--bg-card`)**: `rgba(255, 255, 255, 0.92)` (Pure opaque frosted card)
- **Primary Text Light (`--text-primary`)**: `#111318` (Deep neutral ink)
- **Secondary Text Light (`--text-secondary`)**: `#5A606D` (Muted steel)
- **Specular Light Border (`--border-card`)**: `rgba(0, 0, 0, 0.08)`

---

## 3. Typography Rules
- **Display / Brand**: `'Space Grotesk', -apple-system, sans-serif` — Track-tight (`letter-spacing: -0.03em`), bold structural headers.
- **Body / Interface**: `'Plus Jakarta Sans', -apple-system, sans-serif` — Clean, modern, highly legible at 13px–15px with relaxed 1.45–1.5 line height.
- **Technical / Telemetry**: `'JetBrains Mono', 'SF Mono', monospace` — Formatted for dates, scopes (`read:user`, `repo`), hashes, and commit IDs.
- **Banned**: `Inter` in creative/premium contexts, generic serifs (`Times New Roman`, `Georgia`), and non-system display gimmicks.

---

## 4. Component Stylings

### Login Portal Card
- **Geometry**: 2-column asymmetric layout (`1fr 1.15fr`) on desktop, single-column responsive collapse on `<= 768px`.
- **Border & Shadow**: `1px solid var(--border-card)` with dual shadow (`0 20px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)`).
- **Left Telemetry Panel**: CapstoneFlow project identity, academic classification badge, real defense milestone dates, and official adviser credentials.
- **Right Gateway Panel**: GitHub OAuth 2.0 dedicated gateway with scope disclosures, direct action button, and security verification.

### Buttons & Interactive Controls
- **Primary CTA (`.btn-primary`)**: Solid high-contrast surface with crisp 1px hairline top highlight.
- **Micro-Interaction (`.btn-emil-interactive`)**: Fast hover translation (`translateY(-1px)` in 140ms) and tactile active compression (`transform: scale(0.982)`). No lagging transitions.
- **Scope Badges**: Monospace code pills (`read:user`, `user:email`, `repo`) with subtle neutral background.

---

## 5. Layout Principles
- **Grid Architecture**: CSS Grid layout (`grid-template-columns: repeat(auto-fit, minmax(340px, 1fr))`) ensuring zero overflow and natural responsiveness.
- **Contained Viewport**: Centered layout bounded by `max-width: 960px` with `min-height: 100dvh` flex centering.
- **Hierarchy Order**: Brand and primary title lead the visual hierarchy; metadata and secondary scopes support without fighting for attention.

---

## 6. Motion Philosophy (Emil Kowalski Animation A)
- **Core Timing**: Snappy `380ms - 460ms` durations utilizing the `cubic-bezier(0.16, 1, 0.3, 1)` easing curve.
- **Animation A Hierarchy**:
  1. **Main Card reveal**: Fades and scales in (`scale(0.985)` → `scale(1)`).
  2. **Pill Badges (`.emil-pill-fade`)**: **Pure fade only without translation** (no slide) because metadata shouldn't jump around.
  3. **Main Titles (`.emil-title-lead`)**: Lead the entrance with a gentle upward glide (`translateY(12px)` → `0`).
  4. **Subtitles & Content (`.emil-content-follow`)**: Enter with an organic delay (`160ms`) giving natural reading cadence.
  5. **Call-to-Action (`.emil-cta-enter`)**: Enters after context is set (`250ms`).
  6. **Telemetry & Scopes (`.emil-support-enter`)**: Grouped secondary settlement (`330ms`).
  7. **Footer / Security Note (`.emil-footer-enter`)**: Final subtle anchoring (`410ms`).
- **Accessibility**: Full `@media (prefers-reduced-motion: reduce)` support instantly disables all translations, blurs, and delays.

---

## 7. Anti-Patterns (Explicitly Banned)
- ❌ No emojis anywhere in the interface.
- ❌ No `Inter` or generic web-safe default typography.
- ❌ No pure black (`#000000`).
- ❌ No oversaturated purple/blue AI gradients or neon glowing halos.
- ❌ No fake or fabricated system statistics.
- ❌ No AI copywriting tropes (*"Elevate your workflow"*, *"Unleash the power"*, *"Next-gen AI"*).
- ❌ No robotic uniform `i * 50ms` stagger cascades.
- ❌ No custom pointer mouse cursor trails.
