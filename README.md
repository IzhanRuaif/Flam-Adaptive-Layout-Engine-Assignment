# Adaptive Layout Engine

A constraint-based multi-surface layout engine built in TypeScript and React. It takes a single declarative ad spec and automatically resolves it into fundamentally different layouts (like rows, columns, or grids) based on the specific constraints of a surface.

## Features
- **Zero CSS Media Queries for Layout**: The layout structural decisions are calculated entirely in TypeScript via a Weighted Binary Space Partitioning algorithm.
- **Priority-Based Degradation**: Gracefully drops lower-priority elements when space is insufficient, rather than overlapping or clipping.
- **Strictly Typed**: `AdSpec`, `SurfaceProfile`, and the resulting `ResolvedLayout` are fully typed.
- **Framework Agnostic Core**: The `resolver.ts` is purely mathematical and decoupled from React/DOM, making it compatible with Canvas or WebGL renderers.

## Setup Instructions
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Open `http://localhost:5173` to view the interactive dashboard.

## Demo Application
The demo features a live surface picker:
- **Mobile Portrait** (Tall, vertical stack)
- **Mobile Landscape** (Square-ish, split layout)
- **Broadcast Lower-Third** (Extreme wide, horizontal row)
- **Retail Kiosk** (Square, split layout)
- **Tiny Smartwatch** (Artificially constrained to demonstrate priority degradation)

## Resolution Flow
`Ad Spec + Surface Profile -> Constraint Resolver -> Resolved Layout -> Renderer`

1. **Spec Definition**: Define elements with roles, priorities, and content.
2. **Surface Constraints**: Provide physical dimensions and constraints (e.g. `minTapTarget`).
3. **Constraint Resolver (`resolver.ts`)**: Applies the BSP layout algorithm to position and size elements.
4. **Renderer (`render-dom.tsx`)**: Takes absolute `x,y,w,h` coordinates and renders the final pixels on screen using absolute CSS positioning (no flexbox/grid used for macro layout).

## Layout Algorithm
The engine uses a **Weighted Binary Space Partitioning (BSP)** algorithm.
1. **Degradation Phase**: It first calculates the minimum viable area for all active elements. If the total required area exceeds the surface area, it iteratively drops elements starting with the highest priority number (least important).
2. **Partition Phase**: It recursively splits the available bounding box into two sub-boxes. 
   - If the current box is tall (`h > w * 0.8`), it splits vertically.
   - Otherwise, it splits horizontally.
3. **Weight Allocation**: Elements are assigned a visual weight based on their role (e.g., `hero` is heavier than `branding`). The box split ratio is proportional to the combined weights of the elements assigned to each sub-box.
4. **Resolution**: This recursion natively and organically creates Columns on tall surfaces, Rows on wide surfaces, and Split grids on square surfaces, without a single `if (surface === 'mobile')` statement.

## TypeScript Design
- `spec.ts` defines discriminating unions for elements (`TextAdElement`, `ImageAdElement`, etc.) ensuring invalid roles or missing contents are compile-time errors.
- `surfaces.ts` strongly types constraint profiles.
- `resolver.ts` bridges them, ensuring the output (`ResolvedLayout`) requires no guesswork from the renderer.

## Known Limitations
- Text measurement is currently heuristic (based on approximate character widths and `minTextSize`) rather than using Canvas `measureText`.
- Elements have basic padding/margin rules integrated directly into the split phase (via a `PADDING` constant) rather than per-element customizable margins.

## Time Spent
~4 hours. Focused on building a robust, mathematically sound BSP solver and a polished "wow-factor" dashboard UI.
