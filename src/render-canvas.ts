import type { AdSpec } from './spec';
import type { ResolvedLayout } from './resolver';

/**
 * A secondary renderer demonstrating that the layout resolution is framework agnostic.
 * It renders the exact same ResolvedLayout onto an HTML5 Canvas.
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  spec: AdSpec,
  layout: ResolvedLayout
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Scale for high DPI displays if needed (keeping 1:1 for simplicity here)
  canvas.width = layout.surfaceWidth;
  canvas.height = layout.surfaceHeight;

  // Clear background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  layout.elements.forEach(layoutEl => {
    const specEl = spec.elements.find(e => e.id === layoutEl.id);
    if (!specEl) return;

    ctx.save();
    ctx.globalAlpha = layoutEl.opacity;

    if (specEl.type === 'image') {
      // Draw placeholder
      ctx.fillStyle = specEl.role === 'hero' ? '#1e293b' : 'transparent';
      ctx.fillRect(layoutEl.x, layoutEl.y, layoutEl.width, layoutEl.height);
      
      // Load real image asynchronously
      const img = new Image();
      img.onload = () => {
        ctx.save();
        if (specEl.role === 'hero') {
           // Object-fit: cover approximation
           const ratio = Math.max(layoutEl.width / img.width, layoutEl.height / img.height);
           const w = img.width * ratio;
           const h = img.height * ratio;
           
           // Rounded corners for hero
           ctx.beginPath();
           ctx.roundRect(layoutEl.x, layoutEl.y, layoutEl.width, layoutEl.height, 16);
           ctx.clip();
           
           ctx.drawImage(img, layoutEl.x + (layoutEl.width - w)/2, layoutEl.y + (layoutEl.height - h)/2, w, h);
        } else {
           // Object-fit: contain approximation
           const ratio = Math.min(layoutEl.width / img.width, layoutEl.height / img.height);
           const w = img.width * ratio;
           const h = img.height * ratio;
           ctx.drawImage(img, layoutEl.x + (layoutEl.width - w)/2, layoutEl.y + (layoutEl.height - h)/2, w, h);
        }
        ctx.restore();
      };
      img.src = specEl.src;
    } 
    else if (specEl.type === 'text') {
      ctx.fillStyle = specEl.role === 'primary' ? '#ffffff' : '#94a3b8';
      ctx.font = `${specEl.role === 'primary' ? 'bold' : 'normal'} ${layoutEl.fontSize || 16}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Basic text truncation for canvas (just limits max width)
      ctx.fillText(
        specEl.content, 
        layoutEl.x + layoutEl.width / 2, 
        layoutEl.y + layoutEl.height / 2,
        layoutEl.width - 16
      );
    }
    else if (specEl.type === 'button') {
      // Button Pill
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(layoutEl.x, layoutEl.y, layoutEl.width, layoutEl.height, layoutEl.height / 2);
      ctx.fill();
      
      // Button Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        specEl.content, 
        layoutEl.x + layoutEl.width / 2, 
        layoutEl.y + layoutEl.height / 2
      );
    }
    
    ctx.restore();
  });
}
