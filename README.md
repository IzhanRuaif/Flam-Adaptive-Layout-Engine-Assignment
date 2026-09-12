# 🌌 Flam Adaptive Layout Engine

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

🚀 **Live Deployment:** https://IzhanRuaif.github.io/Flam-Adaptive-Layout-Engine-Assignment

📈 **Algorithm Math (Desmos):** https://www.desmos.com/calculator/qygdlculkf

---

## 📖 Overview

The **Adaptive Layout Engine** is a framework-agnostic layout resolution algorithm that takes a single declarative Ad Specification and adapts it across widely different aspect ratios, dimensions, and constraints (e.g., Mobile Interstitial, Broadcast Lower-Third, Retail Kiosks, Smartwatches).

Rather than relying on brittle CSS `@media` queries, the engine computes exact `(x, y, w, h)` coordinates directly in TypeScript, using a square-root area-based scaling model and aspect-ratio-driven region classification. It is designed to produce non-overlapping resolved regions under the supported constraint model, while maintaining consistent visual proportions across surfaces.

---

## ✨ Core Engineering Highlights

### 📐 1. Square-Root Area-Scaling Algorithm

To prevent text from appearing microscopic on a 1080p kiosk or comically large on a tiny smartwatch, the engine computes a dynamic `scale` factor relative to a baseline mobile surface area:

```ts
const BASE_AREA = 320 * 480;
const areaScale = Math.sqrt((surface.width * surface.height) / BASE_AREA);
const scale = Math.max(0.5, Math.min(areaScale, 3.5)); // Clamped for edge-case safety
```

This continuous algebraic scaling is applied to typography, intrinsic bounding boxes, gaps, and padding, keeping proportions consistent across surfaces.

### 🔲 2. Aspect-Ratio-Driven Region Splitting

The layout classifies the target surface by its aspect ratio (AR) and resolves absolute element coordinates accordingly — no CSS layout engine (Flexbox/Grid) is used to position elements; the resolver computes `x, y, w, h` directly:

- **Tall / Square (AR <= 1.2):** Responsive column allocation. The hero element receives the largest share of remaining vertical space and is centered within the resolved column.
- **Wide (1.2 < AR < 2.5):** Left-right bounding-box split, distributing horizontal space between media and copy.
- **Extreme Wide (AR >= 2.5):** Single-row constraint flow, ideal for broadcast lower-thirds.

**Safe area note:** Text and action elements (headline, CTA, price) are always resolved within the surface's safe area. Hero/media artwork is permitted to extend to the physical surface boundary in Wide and Extreme Wide layouts — this is an intentional design choice so imagery can bleed to the edge like a real ad creative, rather than a constraint gap.

### 📉 3. Priority-Based Degradation

If a target surface lacks the physical space to fit the full layout (e.g., a 200×200 Smartwatch), the engine runs a deterministic degradation sequence:

1. Calculate the minimum space required by the currently active elements.
2. If it doesn't fit, compress gap spacing.
3. If it still doesn't fit, drop the lowest-priority element and recalculate.
4. Repeat until the remaining elements fit.

Priority order (lower number = higher priority, dropped last):

```
hero       1
primary    2
action     3
secondary  4
branding   5
```

### 🎨 4. Framework-Agnostic Architecture

The solving logic (`resolver.ts`) is completely decoupled from the rendering layer.

- **DOM Renderer:** Applies the resolved coordinates via `position: absolute`, bypassing the browser's own layout engine.
- **Canvas 2D Renderer:** Draws the ad onto an HTML5 Canvas using the same resolved coordinates.

*Both renderers consume the identical `ResolvedLayout` output and are toggleable in the live UI.*

---

## 🛠️ Local Development

Clone the repository and run the local development server:

```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```

---

*Designed and engineered for the Flam UI/Frontend Engineering Assignment.*
