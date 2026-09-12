import type { AdSpec, AdElement, ElementRole } from "./spec";
import type { SurfaceProfile } from "./surfaces";

export interface ElementLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface ResolvedLayout {
  surfaceWidth: number;
  surfaceHeight: number;
  elements: ElementLayout[];
  droppedElements: string[];
  explanations: string[];
}

interface Box { x: number; y: number; w: number; h: number; }

const COLUMN_ORDER: Record<ElementRole, number> = { primary: 1, hero: 2, secondary: 3, action: 4, branding: 5 };
const PRIORITY_ORDER: Record<ElementRole, number> = { hero: 1, primary: 2, action: 3, secondary: 4, branding: 5 };

function getIntrinsicSize(element: AdElement, surface: SurfaceProfile, scale: number) {
  const minTap = Math.max(surface.minTapTarget || 44, 44 * scale);
  const isTiny = scale < 0.6;
  
  if (element.role === 'hero') return { minW: isTiny ? 60 : 100 * scale, minH: isTiny ? 60 : 100 * scale };
  if (element.type === 'button') return { minW: 140 * scale, minH: isTiny ? 32 : minTap };
  if (element.role === 'primary') return { minW: 140 * scale, minH: isTiny ? 24 : Math.max(surface.minTextSize || 16, 36 * scale) * 1.3 };
  if (element.role === 'secondary') return { minW: 100 * scale, minH: isTiny ? 16 : 24 * scale };
  if (element.role === 'branding') return { minW: 50 * scale, minH: isTiny ? 20 : 32 * scale };
  
  return { minW: 50 * scale, minH: 24 * scale };
}

function getFontSize(element: AdElement, scale: number) {
    if (element.type !== 'text') return undefined;
    const isTiny = scale < 0.6;
    if (element.role === 'primary') return isTiny ? 16 : 24 * scale;
    return isTiny ? 11 : 14 * scale;
}

export function resolveLayout(spec: AdSpec, surface: SurfaceProfile): ResolvedLayout {
  const safeArea = surface.safeArea || { top: 20, right: 20, bottom: 20, left: 20 };
  const B: Box = {
    x: safeArea.left,
    y: safeArea.top,
    w: surface.width - safeArea.left - safeArea.right,
    h: surface.height - safeArea.top - safeArea.bottom,
  };

  const AR = B.w / B.h;
  
  // Calculate relative scale factor based on 320x480 Mobile Portrait area
  const BASE_AREA = 320 * 480;
  const areaScale = Math.sqrt((surface.width * surface.height) / BASE_AREA);
  // Clamp scale so text doesn't become totally illegible on watch or comically huge on kiosk
  const scale = Math.max(0.5, Math.min(areaScale, 3.5));

  const explanations: string[] = [];
  explanations.push(`Dimensions: ${B.w}x${B.h}. AR: ${AR.toFixed(2)}. Scale Factor: ${scale.toFixed(2)}x`);

  const activeElements = [...spec.elements];
  const droppedElements: string[] = [];
  const layoutOutput: ElementLayout[] = [];
  let fits = false;
  let finalElements: AdElement[] = [];
  let GAP = 16 * scale;
  
  const isWide = AR > 1.2 && AR < 2.5;
  const isTallOrSquare = AR <= 1.2;

  while (!fits && activeElements.length > 0) {
    let requiredSpaceWithLargeGap = 0;
    let requiredSpaceWithSmallGap = 0;

    if (isTallOrSquare) {
      const sumH = activeElements.reduce((sum, el) => sum + getIntrinsicSize(el, surface, scale).minH, 0);
      requiredSpaceWithLargeGap = sumH + Math.max(0, activeElements.length - 1) * (16 * scale);
      requiredSpaceWithSmallGap = sumH + Math.max(0, activeElements.length - 1) * (4 * scale);
      
      if (requiredSpaceWithLargeGap <= B.h || activeElements.length === 0) { fits = true; GAP = 16 * scale; }
      else if (requiredSpaceWithSmallGap <= B.h) { fits = true; GAP = 4 * scale; }
    } else if (isWide) {
      const contentElements = activeElements.filter(e => e.role !== 'hero');
      const sumH = contentElements.reduce((sum, el) => sum + getIntrinsicSize(el, surface, scale).minH, 0);
      
      requiredSpaceWithLargeGap = sumH + Math.max(0, contentElements.length - 1) * (16 * scale);
      requiredSpaceWithSmallGap = sumH + Math.max(0, contentElements.length - 1) * (4 * scale);
      
      if (requiredSpaceWithLargeGap <= B.h || contentElements.length === 0) { fits = true; GAP = 16 * scale; }
      else if (requiredSpaceWithSmallGap <= B.h) { fits = true; GAP = 4 * scale; }
    } else {
      const contentElements = activeElements.filter(e => e.role !== 'hero');
      const sumW = contentElements.reduce((sum, el) => sum + getIntrinsicSize(el, surface, scale).minW, 0);
      const mediaW = B.h * 1.5;
      const contentW = B.w - mediaW - 24;

      requiredSpaceWithLargeGap = sumW + Math.max(0, contentElements.length - 1) * (16 * scale);
      requiredSpaceWithSmallGap = sumW + Math.max(0, contentElements.length - 1) * (4 * scale);
      
      if (requiredSpaceWithLargeGap <= contentW || contentElements.length === 0) { fits = true; GAP = 16 * scale; }
      else if (requiredSpaceWithSmallGap <= contentW) { fits = true; GAP = 4 * scale; }
    }

    if (fits) {
      finalElements = activeElements;
    } else {
      activeElements.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return PRIORITY_ORDER[a.role] - PRIORITY_ORDER[b.role];
      });
      const dropped = activeElements.pop();
      if (dropped) droppedElements.push(dropped.id);
    }
  }

  if (droppedElements.length > 0) {
    explanations.push(`Area insufficient. Compressed gaps to ${GAP.toFixed(0)}px, dropped ${droppedElements.length} items.`);
  } else {
    explanations.push(`All elements fit. Applied responsive scale factor ${scale.toFixed(2)}x.`);
  }

  if (isTallOrSquare) {
    explanations.push(`Strategy: Responsive Column Flow. Hero perfectly centered using flex-grow.`);
    
    finalElements.sort((a, b) => COLUMN_ORDER[a.role] - COLUMN_ORDER[b.role]);
    
    const sizes = finalElements.map(el => getIntrinsicSize(el, surface, scale));
    const totalMinH = sizes.reduce((sum, s) => sum + s.minH, 0) + GAP * Math.max(0, finalElements.length - 1);
    const remainingH = Math.max(0, B.h - totalMinH);
    
    const getWeight = (el: AdElement) => el.role === 'hero' ? 10 : 0;
    const totalWeight = finalElements.reduce((sum, el) => sum + getWeight(el), 0);
    
    let currentY = B.y;
    finalElements.forEach((el, i) => {
        const size = sizes[i];
        const extraH = totalWeight > 0 ? (getWeight(el) / totalWeight) * remainingH : 0;
        const h = size.minH + extraH;
        
        let w = size.minW;
        let x = B.x;
        
        if (el.role === 'hero') {
            w = B.w; 
        } else if (el.type === 'button') {
            w = Math.min(B.w, 300 * scale);
            x = B.x + (B.w - w) / 2;
        } else if (el.role === 'branding') {
            w = Math.min(size.minW * 2, B.w * 0.4);
            x = B.x + (B.w - w) / 2;
        } else {
            w = B.w; 
        }
        
        layoutOutput.push({
            id: el.id,
            x, y: currentY,
            width: w, height: h,
            opacity: 1,
            textAlign: 'center',
            fontSize: getFontSize(el, scale)
        });
        currentY += h + GAP;
    });

  } else if (isWide) {
    explanations.push(`Strategy: Responsive Left/Right Split.`);
    const mediaBox = { x: 0, y: 0, w: surface.width * 0.45, h: surface.height };
    const contentBox = { x: mediaBox.w + (24 * scale), y: B.y, w: surface.width - mediaBox.w - (24 * scale) - safeArea.right, h: B.h };
    
    const hero = finalElements.find(e => e.role === 'hero');
    if (hero) layoutOutput.push({ id: hero.id, x: mediaBox.x, y: mediaBox.y, width: mediaBox.w, height: mediaBox.h, opacity: 1 });
    
    const contentElements = finalElements.filter(e => e.role !== 'hero').sort((a, b) => COLUMN_ORDER[a.role] - COLUMN_ORDER[b.role]);
    const totalH = contentElements.reduce((sum, el) => sum + getIntrinsicSize(el, surface, scale).minH, 0) + GAP * Math.max(0, contentElements.length - 1);
    let currentY = contentBox.y + Math.max(0, (contentBox.h - totalH) / 2);
    
    contentElements.forEach(el => {
      const size = getIntrinsicSize(el, surface, scale);
      let w = contentBox.w;
      let x = contentBox.x;
      if (el.type === 'button') { w = Math.min(w, 200 * scale); }
      if (el.role === 'branding') { w = size.minW; }
      
      layoutOutput.push({
        id: el.id, x, y: currentY, width: w, height: size.minH, opacity: 1, textAlign: 'left',
        fontSize: getFontSize(el, scale)
      });
      currentY += size.minH + GAP;
    });
  } else {
    explanations.push(`Strategy: Responsive Extreme Wide Row.`);
    const mediaBox = { x: 0, y: 0, w: surface.width * 0.25, h: surface.height };
    const contentBox = { x: mediaBox.w + (24 * scale), y: B.y, w: surface.width - mediaBox.w - (24 * scale) - safeArea.right, h: B.h };
    
    const hero = finalElements.find(e => e.role === 'hero');
    if (hero) layoutOutput.push({ id: hero.id, x: mediaBox.x, y: mediaBox.y, width: mediaBox.w, height: mediaBox.h, opacity: 1 });
    
    const contentElements = finalElements.filter(e => e.role !== 'hero').sort((a, b) => COLUMN_ORDER[a.role] - COLUMN_ORDER[b.role]);
    let currentX = contentBox.x;
    const remainingW = Math.max(0, contentBox.w - contentElements.reduce((s, e) => s + getIntrinsicSize(e, surface, scale).minW, 0) - GAP * Math.max(0, contentElements.length - 1));
    const extraSpace = contentElements.length > 0 ? remainingW / contentElements.length : 0;
    
    contentElements.forEach(el => {
      const size = getIntrinsicSize(el, surface, scale);
      const w = size.minW + extraSpace;
      const h = el.type === 'button' || el.role === 'branding' ? size.minH : contentBox.h;
      const y = contentBox.y + (contentBox.h - h) / 2;
      
      // Give extreme wide texts a slight bump since they have so much space
      const fontSize = getFontSize(el, scale * 1.2); 

      layoutOutput.push({
        id: el.id, x: currentX, y, width: w, height: h, opacity: 1, textAlign: 'left',
        fontSize
      });
      currentX += w + GAP;
    });
  }

  return {
    surfaceWidth: surface.width,
    surfaceHeight: surface.height,
    elements: layoutOutput,
    droppedElements,
    explanations,
  };
}
