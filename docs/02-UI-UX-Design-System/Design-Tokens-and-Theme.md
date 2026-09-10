---
title: "UI/UX Design Tokens & Tailwind Theme"
tags:
  - bhoomi-mitra
  - ui-ux
  - tailwind
  - design-system
  - colors
date: 2026-09-07
---

# 🎨 UI/UX Design Tokens & Tailwind Theme

> **MOC Link**: [[00-Bhoomi-Mitra-MOC|Back to Master Index]]

## 1. Design Philosophy: "Confidence Through Clarity"
Land portal interfaces in India are traditionally cluttered, confusing, and stressful. The Bhoomi Mitra design system adopts a **Cyber-Civic Dark Mode** aesthetics:
- High contrast, dark navy surfaces to minimize eye strain and elevate critical status colors.
- Universal semantic color coding: **Green (Safe)**, **Amber (Attention/Pending)**, **Crimson (Danger/Litigation)**.
- Micro-interactions (sonar pulse, glowing borders, smooth timeline expansion) that provide immediate tactile reassurance to citizens.

---

## 2. Color Palette & Token Definitions

| Token Name | Hex Code | RGB | Role / Usage |
| :--- | :--- | :--- | :--- |
| `background.deep` | `#070F1E` | `rgb(7, 15, 30)` | Global app background, body canvas |
| `background.card` | `#111E36` | `rgb(17, 30, 54)` | Card panels, floating widgets, search container |
| `background.subtle` | `#0F1A30` | `rgb(15, 26, 48)` | Input fields, table row alternates, nested containers |
| `accent.emerald` | `#10B981` | `rgb(16, 185, 129)` | Verified Land, Clear Title, Mutation Completed |
| `accent.amber` | `#F59E0B` | `rgb(245, 158, 11)` | Pending NOC, Circle Rate Price Gap warning |
| `accent.crimson` | `#EF4444` | `rgb(239, 68, 68)` | High Risk, Court Dispute, Forest/Highway Overlap |
| `accent.blue` | `#3B82F6` | `rgb(59, 130, 246)` | Bhu-Aadhar verified badge, Primary CTA, Voice Mic glow |
| `text.primary` | `#F8FAFC` | `rgb(248, 250, 252)` | Headings, key figures, critical metrics |
| `text.secondary` | `#94A3B8` | `rgb(148, 163, 184)` | Captions, metadata, hints, unselected tabs |

---

## 3. Tailwind Configuration (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          deep: '#070F1E',
          card: '#111E36',
          subtle: '#0F1A30',
        },
        accent: {
          emerald: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.45)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.45)',
        'glow-crimson': '0 0 20px rgba(239, 68, 68, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sonar': 'sonarEffect 1.5s ease-out infinite',
      },
      keyframes: {
        sonarEffect: {
          '0%': { transform: 'scale(0.95)', opacity: '0.6' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
```

---

## 4. Typography Hierarchy
- **Heading 1 (`text-3xl font-extrabold font-display`)**: Hero search headers, Bhu-Aadhar ID verification banner.
- **Heading 2 (`text-xl font-bold text-white`)**: Section titles (GIS Map, Trust Score, Administrative Timeline).
- **Metric Big Numbers (`text-2xl font-black text-accent-emerald`)**: Acres, Circle Rate gap %, Trust Score %.
- **Legal Badges (`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider`)**: "Clear Title", "Dispute Warning", "Forest Buffer".

---

## 5. Related Notes
- [[Component-LandMap|LandMap Component Specification]]
- [[Component-Risk-and-Gauge|Risk Widget & Trust Score Gauge]]
- [[Component-TimelineBar|Administrative Delay Timeline Bar]]
