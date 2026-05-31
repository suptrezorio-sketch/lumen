# 02 — Framework7 Design System

## Main decision

Use **Framework7** as the unified app wireframe.

Framework7 is the structure. Lumen design tokens are the visual identity.

## Framework7 shell

Use:

```text
App
View
Page
Navbar
Toolbar / Bottom tabs
Block
BlockTitle
List
ListItem
Sheet
Popup
Dialog
Picker
Swiper / carousel
Segmented controls
```

## Visual identity

LUMEN = monochrome banking.

Light mode:

```text
background: #FFFFFF
cards: #F5F5F7
text: #1A1A1A
buttons: #1A1A1A
accent: #007AFF
```

Dark mode:

```text
background: #000000
cards: #1C1C1E
text: #FFFFFF
buttons: #FFFFFF
accent: #007AFF
```

Rules:

```text
No decorative colors.
No random gradients.
Only banking cards may use gradients.
Status colors are functional only.
Accent color: #007AFF.
```

## Typography

Use:

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
```

Input text must be at least `16px` on mobile.

## Bottom navigation

Tabs:

```text
Home
Cards
Crypto
History
Profile
```

Hide bottom nav on full-screen flows:

```text
/transfers
/utilities
/credit
/chat
/topup
/withdraw
/admin/*
/verification-flow
/bank-call
```

## Admin design

The current AI-made admin screenshot is not acceptable.

Avoid:

```text
giant empty page
flat user rows
random buttons
no client detail panel
no real CRM structure
no financial dashboard
no operation queue
no document review UX
no control center feeling
```

Admin must look like fintech control software.

## iOS PWA restrictions

Avoid:

```text
backdrop-blur on sticky headers
spring animations on toggles
complex AnimatePresence on frequent updates
CSS blur above scroll content
preserve-3d on scroll containers
input font-size below 16px
body scroll chaos
```

Use:

```text
safe areas
inner scroll containers
touch-action: manipulation
tap highlight transparent
custom keyboards in PWA
```
