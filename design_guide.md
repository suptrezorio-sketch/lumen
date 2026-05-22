# LUMEN Bank — Design Guide & Style System

> **Version**: 2.0 · **Date**: 2026-05-12
> **Purpose**: Definitive visual reference. No guessing. Every component follows these rules.

---

## 1. Design Philosophy

**LUMEN = Monochromatic Banking**

The entire UI is built on a **black/white inversion** principle:
- **Light mode**: Black elements on white background
- **Dark mode**: White elements on black background
- **Accent color**: Only `#007AFF` (iOS blue) for interactive highlights
- **No gradients** on UI chrome — only on banking cards
- **No decorative colors** — status colors (green/red/yellow) are functional only

```
┌─────────────────────────────┐
│  LIGHT MODE                 │
│  Background:  #FFFFFF       │
│  Cards:       #F5F5F7       │
│  Text:        #1A1A1A       │
│  Nav bar:     #1A1A1A       │
│  Buttons:     #1A1A1A       │
│  Accent:      #007AFF       │
└─────────────────────────────┘

┌─────────────────────────────┐
│  DARK MODE (.dark class)    │
│  Background:  #000000       │
│  Cards:       #1C1C1E       │
│  Text:        #FFFFFF       │
│  Nav bar:     #1C1C1E       │
│  Buttons:     #FFFFFF        │
│  Accent:      #007AFF       │
└─────────────────────────────┘
```

---

## 2. Color Tokens

### CSS Custom Properties (`index.css`)

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --lumen-accent: #007AFF;
  --lumen-bg: #FFFFFF;
  --lumen-card: #F5F5F7;
  --lumen-text: #1A1A1A;
  --lumen-text-secondary: rgba(26,26,26,0.5);
  --lumen-nav: #1A1A1A;
}

.dark {
  --lumen-bg: #000000;
  --lumen-card: #1C1C1E;
  --lumen-text: #FFFFFF;
  --lumen-text-secondary: rgba(255,255,255,0.5);
  --lumen-nav: #1C1C1E;
}
```

### Tailwind Tokens (`tailwind.config.js`)

| Token | Value | Usage |
|---|---|---|
| `lumen-black` | `#1A1A1A` | Primary text, buttons, icons |
| `lumen-dark` | `#2C2C2E` | Secondary surfaces |
| `lumen-card` | `#F5F5F7` | Card backgrounds (light mode) |
| `lumen-accent` | `#007AFF` | Interactive elements, links |
| `lumen-success` | `#30D158` | Positive states |
| `lumen-warning` | `#FF9F0A` | Warning states |
| `lumen-danger` | `#FF453A` | Error/danger states |

### Status Colors (functional only)

| State | Light Background | Text |
|---|---|---|
| Success | `bg-green-100` | `text-green-600` |
| Warning | `bg-yellow-100` | `text-yellow-600` |
| Danger | `bg-red-100` | `text-red-600` |
| Info | `bg-blue-100` | `text-blue-600` |
| Neutral | `bg-gray-100` | `text-gray-600` |

---

## 3. Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
```

**Priority**: SF Pro Display on Apple devices → Inter as cross-platform fallback.

### Scale

| Role | Size | Weight | Tailwind |
|---|---|---|---|
| Page title (H1) | `text-4xl` (36px) | `font-bold` (700) | `text-4xl font-bold` |
| Section title (H2) | `text-2xl` (24px) | `font-bold` (700) | `text-2xl font-bold` |
| Card title | `text-lg` (18px) | `font-bold` (700) | `text-lg font-bold` |
| Screen header | `text-base` (16px) | `font-bold` (700) | `text-base font-bold` |
| Body text | `text-sm` (14px) | `font-medium` (500) | `text-sm font-medium` |
| Caption | `text-xs` (12px) | `font-semibold` (600) | `text-xs font-semibold` |
| Micro label | `text-[10px]` | `font-bold` (700) | `text-[10px] font-bold` |
| Badge text | `text-[9px]` | `font-bold` (700) | `text-[9px] font-bold` |
| Monospace (cards, IDs) | `text-sm` | `font-mono font-bold` | `font-mono text-sm font-bold` |

### Label Conventions

- **Section headers**: `text-xs font-bold text-gray-400 uppercase tracking-wider`
- **Admin tab buttons**: `text-xs font-black uppercase tracking-tight`
- **Status badges**: `text-[10px] px-2 py-0.5 rounded-full font-bold uppercase`

---

## 4. Component Specifications

### 4.1 Banking Cards

```
┌─────────────────────────────────┐
│  Aspect Ratio: 1.58 : 1        │
│  (CSS: aspect-[1.58/1])        │
│                                 │
│  Border Radius: rounded-2xl     │
│  (16px)                        │
│                                 │
│  Padding: p-5                  │
│                                 │
│  Fiat gradient:                │
│    linear-gradient(135deg,     │
│    #1C1C1E, #2C2C2E)          │
│                                 │
│  Smart gradient:               │
│    linear-gradient(135deg,     │
│    #F0F0F5, #E8E8F0)          │
│                                 │
│  Card flip: CSS 3D transform   │
│  perspective: 1000px           │
│  rotateY(180deg)               │
│                                 │
│  Blocked state:                │
│  - border-2 border-dashed      │
│    border-red-500 opacity-80   │
│  - Overlay: bg-black/60 with   │
│    Lock icon + "BLOCKED" text  │
└─────────────────────────────────┘
```

**Home carousel cards**: `min-w-[270px] h-[160px]` (compact version)
**Cards screen**: `w-full aspect-[1.58/1]` (full-width version)

### 4.2 Buttons

| Type | Class |
|---|---|
| **Primary** | `bg-lumen-black dark:bg-white text-white dark:text-black rounded-2xl font-bold py-4` |
| **Secondary** | `bg-gray-100 dark:bg-gray-800 text-lumen-black dark:text-white rounded-2xl font-bold py-4` |
| **Danger** | `border border-red-200 dark:border-red-800 text-red-600 rounded-2xl font-semibold bg-red-50 dark:bg-red-900/10` |
| **Icon button** | `w-9 h-9 bg-lumen-black dark:bg-white/10 text-white rounded-xl` |
| **Tab button** (active) | `bg-lumen-black dark:bg-white text-white dark:text-black shadow-lg rounded-xl` |
| **Tab button** (inactive) | `text-gray-400 hover:text-lumen-black dark:hover:text-white` |
| **Admin control** | `py-3 bg-[color]-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest` |

**Animation**: All buttons use `whileTap={{ scale: 0.97 }}` (Framer Motion).

### 4.3 Inputs

```
Standard input:
  w-full p-4
  bg-gray-50 dark:bg-[#1C1C1E]
  rounded-xl (12px) or rounded-2xl (16px)
  text-sm text-lumen-black dark:text-white
  outline-none
  border-2 border-transparent
  focus:border-blue-500/30
```

**Labels**: Always above input, `text-xs font-semibold text-gray-500 uppercase tracking-wider`

> [!CAUTION]
> **DO NOT use `font-size < 16px` on mobile inputs.**
> iOS Safari will auto-zoom the viewport if input font size < 16px.
> Mitigated via `maximum-scale=1.0, user-scalable=0` in viewport meta.

### 4.4 Toggle Switch

```jsx
<button className={`w-12 h-7 rounded-full transition-colors relative
  ${value ? 'bg-lumen-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
  <div className={`w-5 h-5 rounded-full bg-white dark:bg-black
    absolute top-1 transition-all duration-300
    ${value ? 'left-[24px]' : 'left-[4px]'}`} />
</button>
```

> [!WARNING]
> **DO NOT use Framer Motion `spring` or `animate` on toggle knobs.**
> This causes the "alive toggle" bug on iOS where hover events trigger animations.
> Use CSS `transition-all duration-300` only.

### 4.5 Bottom Navigation

```
Position: fixed bottom-0
Container: max-w-[430px] centered
Background: bg-lumen-black dark:bg-[#1C1C1E]
Border radius: rounded-2xl
Padding: p-1.5
Tab size: w-14 h-12

Active indicator: layoutId="navPill"
  bg-[#2C2C2E] dark:bg-[#3A3A3C]
  rounded-xl

Icon size: 18px
Label: text-[9px] font-medium

Tabs: Home, Cards, Crypto, History, Profile
```

**Hidden on**: `/transfers`, `/utilities`, `/credit`, `/chat`, `/topup`, `/withdraw`, `/admin/*`

### 4.6 Screen Headers

```
Position: sticky top-0
Background: bg-white/90 dark:bg-black/90
Border: border-b border-gray-100 dark:border-gray-800
Padding: px-5 py-3
Z-index: z-30

Layout: flex items-center justify-between
  Left: Back arrow (ArrowLeft, size 22)
  Center: title (text-base font-bold)
  Right: spacer (w-6) or action button
```

> [!CAUTION]
> **DO NOT use `backdrop-blur-md`** on sticky headers in iOS PWA standalone mode.
> This causes touch events to stop propagating, freezing the entire app.
> Use opaque `bg-white dark:bg-black` or semi-transparent `bg-white/90` WITHOUT blur.

### 4.7 Setting Rows

```
Container: bg-gray-50 dark:bg-[#1C1C1E] rounded-2xl overflow-hidden
Row: p-3.5 flex items-center justify-between
  border-b border-gray-100 dark:border-gray-800 (except last)

Left side:
  Icon container: w-8 h-8 bg-gray-100 dark:bg-[#2C2C2E] rounded-lg
  Label: text-sm font-medium

Right side:
  Toggle, or badge, or ChevronRight (size 16, text-gray-300)
```

---

## 5. Layout Grid

### App Container

```
max-w-[430px]  ← iPhone 14 Pro Max width
mx-auto        ← Centered
h-screen       ← Full viewport
overflow-hidden ← No body scroll
```

All scrollable content uses `overflow-y-auto scrollbar-hide` on inner containers.

### Spacing

| Token | Value | Usage |
|---|---|---|
| `p-4` / `px-4` | 16px | Standard content padding |
| `p-5` / `px-5` | 20px | Screen-level padding |
| `gap-2` | 8px | Tight element spacing |
| `gap-3` | 12px | Standard element spacing |
| `gap-4` | 16px | Section spacing |
| `space-y-5` | 20px | Vertical section spacing |
| `pb-28` | 112px | Bottom padding for nav clearance |
| `mb-5` | 20px | Section bottom margin |

### Safe Areas

```css
.safe-top { padding-top: env(safe-area-inset-top, 0px); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
```

Applied to: Bottom nav, keyboard areas, fullscreen overlays.

---

## 6. Animations

### Approved Patterns

| Pattern | Implementation | Usage |
|---|---|---|
| Button press | `whileTap={{ scale: 0.97 }}` | All tappable elements |
| Page transition | `AnimatePresence mode="wait"` + slide | Route changes |
| List stagger | `transition={{ delay: i * 0.05 }}` | Transaction lists |
| Fade in | `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` | Content load |
| Slide up | `initial={{ y: 20 }} animate={{ y: 0 }}` | Cards, content |
| Nav pill | `layoutId="navPill"` | Bottom tab indicator |
| Card flip | CSS `transform: rotateY(180deg)` | Card back reveal |
| OTP modal | `initial={{ y: '100%' }} animate={{ y: 0 }}` | Bottom sheet |
| Shake error | `animate={{ x: [-10, 10, -10, 10, 0] }}` | PIN error |

### Forbidden Patterns

> [!CAUTION]
> These cause iOS PWA crashes or performance issues:

| ❌ Pattern | Why |
|---|---|
| `backdrop-blur` on sticky elements | Breaks touch propagation in iOS standalone |
| `type: 'spring'` on toggle animations | Causes hover-triggered jitter on iOS |
| Complex `AnimatePresence` on high-frequency updates | Memory leak |
| `transform-style: preserve-3d` on scrollable containers | GPU compositing conflicts |
| CSS `filter: blur()` on elements above scrollable content | Freezes scroll on iOS |

---

## 7. Custom Keyboards

### PIN Keypad
```
Grid: grid-cols-3 gap-x-8 gap-y-4
Button: w-[76px] h-[76px] rounded-full
Font: text-3xl font-medium
Style: bg-gray-50 dark:bg-[#1C1C1E]
Layout: [1-9, '', 0, del]
Delete icon: ArrowLeft size 28
```

### Chat QWERTY Keyboard
```
Container: bg-gray-200 dark:bg-[#1C1C1E] p-2
Key: h-11 rounded-lg text-[17px]
Regular key: bg-white dark:bg-[#2C2C2E] shadow-sm
Special key: bg-gray-300 dark:bg-gray-600 px-3
Space: w-[50%]
Modes: alpha, alphaUpper, num, sym
```

### OTP Keypad
```
Grid: grid-cols-3 gap-3
Button: h-14 rounded-xl text-xl font-semibold
Style: bg-gray-50 dark:bg-[#2C2C2E]
Input boxes: w-11 h-14 rounded-xl border-2
```

---

## 8. Dark Mode Strategy

Dark mode is toggled via the `dark` CSS class on `<html>`.

### Automatic Mappings (index.css overrides)

```css
.dark .bg-white { background-color: #000 !important; }
.dark .bg-gray-50 { background-color: #1C1C1E !important; }
.dark .bg-gray-100 { background-color: #2C2C2E !important; }
.dark .text-lumen-black { color: #fff !important; }
.dark .border-gray-100 { border-color: #2C2C2E !important; }
.dark .bg-white\/90 { background-color: rgba(0,0,0,0.9) !important; }
```

### Component Convention

Every component MUST specify both light and dark variants inline:

```jsx
// ✅ CORRECT
className="bg-white dark:bg-black text-lumen-black dark:text-white"

// ❌ WRONG (relies on CSS override, fragile)
className="bg-white text-lumen-black"
```

---

## 9. iOS PWA Compatibility Checklist

| Rule | Implementation |
|---|---|
| **No zoom on input focus** | `<meta name="viewport" content="maximum-scale=1.0, user-scalable=0">` |
| **Standalone mode** | `<meta name="apple-mobile-web-app-capable" content="yes">` |
| **Status bar** | `<meta name="apple-mobile-web-app-status-bar-style" content="default">` |
| **Safe areas** | `env(safe-area-inset-*)` via CSS classes |
| **No backdrop-blur on sticky** | Use opaque backgrounds instead |
| **No spring animations on interactive** | Use CSS transitions |
| **Touch manipulation** | `touch-action: manipulation` on html |
| **Tap highlight** | `-webkit-tap-highlight-color: transparent` |
| **Scroll containment** | `overflow: hidden` on body, scroll on inner containers |
| **Install prompt** | `PWAInstallation` component for iOS instructions |

---

## 10. Admin Panel Styling

The admin panel follows the same design tokens but at **desktop scale**:

| Property | Client (Mobile) | Admin (Desktop) |
|---|---|---|
| Max width | `430px` | `max-w-7xl` (1280px) |
| Padding | `p-5` | `p-4 md:p-8` |
| Cards | Single column | `grid-cols-1` with responsive |
| Tables | Scrollable | Full-width tables |
| Typography | Mobile scale | Same tokens |
| Tabs | Horizontal scroll | `flex-wrap` |
| Status badge | `text-[10px]` | Same |
| Control buttons | Full width | `grid-cols-2` |
