# 🌌 Flam Adaptive Layout Engine

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

🚀 **Live Deployment (Vercel):** [https://flam-adaptive-layout-engine-assignm.vercel.app](https://flam-adaptive-layout-engine-assignm.vercel.app)

---

## 📖 Overview
The **Adaptive Layout Engine** is a mathematical, framework-agnostic solving algorithm designed to take a single declarative Ad Specification and intelligently resolve it across wildly different aspect ratios, dimensions, and constraints (e.g., Mobile Interstitial, Broadcast Lower-Third, Retail Kiosks, Smartwatches). 

Rather than relying on brittle CSS `@media` queries, this engine uses a **Square-Root Area-Scaling Algorithm** and **Heuristic Region Splitting** to compute exact `(x, y, w, h)` coordinates, ensuring zero visual overlap and maintaining premium aesthetic integrity on any surface.

---

## ✨ Core Engineering Highlights

### 📐 1. Square-Root Area-Scaling Algorithm
To prevent text from appearing microscopic on a 1080p kiosk or comically large on a tiny smartwatch, the engine computes a dynamic `scale` factor relative to a baseline mobile surface area:
```typescript
const BASE_AREA = 320 * 480;
const areaScale = Math.sqrt((surface.width * surface.height) / BASE_AREA);
const scale = Math.max(0.5, Math.min(areaScale, 3.5)); // Clamped for edge-case safety
```
This continuous algebraic scaling is applied to typography, intrinsic bounding boxes, flex gaps, and padding, ensuring flawless proportional aesthetics. 

### 🔲 2. Dynamic Region Splitting
The layout dynamically classifies the surface constraint by its aspect ratio (AR) and solves the flow accordingly:
- **Tall / Square (AR <= 1.2):** Pure Column Flex-Flow. Automatically calculates `flex-grow` equivalents to vertically center the Hero Product exactly at the true geometric center.
- **Wide (1.2 < AR < 2.5):** Left-Right Bounding Box split, ensuring horizontal space is perfectly distributed between media and copy.
- **Extreme Wide (AR >= 2.5):** Single-row constraint flow, ideal for broadcast lower-thirds.

### 📉 3. Priority-Based Degradation
If a target surface lacks the physical space to render the layout without causing overlap (e.g., a 200x200 Smartwatch), the engine enters a deterministic degradation loop. It mathematically compresses gap spaces first, and if constraints still fail, it gracefully drops layout elements based on strict priority rankings (e.g., discarding the logo or price before dropping the CTA).

### 🎨 4. Framework-Agnostic Architecture
The solving logic (`resolver.ts`) is completely decoupled from the rendering layer. 
- **DOM Renderer:** Bypasses browser layout engines by strictly using `position: absolute` with the solved coordinates.
- **Canvas 2D Renderer:** Natively draws the Ad onto an HTML5 Canvas using identical engine coordinates. 
*Both renderers are natively toggleable in the live UI.*

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
