# Architecture

This document describes the separation of concerns within the Adaptive Layout Engine.

## Clean Separation

The project is strictly divided into four distinct layers:

1. **Specification Layer (`spec.ts`)**
   - Pure data structures.
   - Defines the user intent (what the ad is, what elements exist, their roles, and priorities).
   - Unaware of physical constraints, screen sizes, or pixels.

2. **Constraint Layer (`surfaces.ts`)**
   - Pure data structures.
   - Defines the physical limitations of the display target (width, height, safe areas, accessibility constraints like tap targets).
   - Unaware of what content will be placed inside it.

3. **Resolution Layer (`resolver.ts`)**
   - The algorithmic bridge.
   - **Inputs:** `AdSpec` + `SurfaceProfile`
   - **Output:** `ResolvedLayout` (array of objects with absolute `x, y, w, h` pixel values).
   - **Properties:**
     - 100% framework agnostic (no React, no DOM APIs).
     - Pure mathematical logic.
     - Extensible: a new surface can be added without modifying the resolver, as long as it conforms to the `SurfaceProfile` constraints.

4. **Rendering Layer (`render-dom.tsx`)**
   - Presentation only.
   - Consumes the `ResolvedLayout` and maps the absolute coordinates to DOM elements via `style={{ position: 'absolute', left: x, top: y }}`.
   - Because the resolver outputs absolute coordinates, this layer could easily be swapped out for a `<canvas>` renderer (`render-canvas.ts`) or a WebGL renderer without changing a single line of the layout logic.

## Why This Architecture?

If layout logic were mixed with rendering (e.g., using CSS Grid or Flexbox media queries), adding a fundamentally new surface profile (like a 360-degree VR billboard with non-standard viewport proportions) would require substantial rewrites of the CSS.

By pushing layout decisions to a mathematically driven TypeScript layer, the engine genuinely *solves* the spatial requirements for each surface on the fly, rather than approximating them with layout heuristics baked into stylesheets.
