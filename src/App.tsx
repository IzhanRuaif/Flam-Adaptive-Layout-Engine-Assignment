import { useState, useMemo, useEffect, useRef } from 'react';
import { surfaces } from './surfaces';
import nikeSneaker from './assets/centered_nike_sneaker.jpg';
import { defineAd } from './spec';
import type { AdSpec } from './spec';
import { resolveLayout } from './resolver';
import { AdRendererDOM } from './render-dom';
import { renderToCanvas } from './render-canvas';
import { Monitor, Smartphone, Watch, Settings2, Box, Info, Plus } from 'lucide-react';

const MOCK_AD: AdSpec = defineAd({
  elements: [
    { id: 'product-image', type: 'image', role: 'hero', priority: 1, src: nikeSneaker },
    { id: 'headline', type: 'text', role: 'primary', priority: 1, content: 'Nike Air Max 270' },
    { id: 'cta-btn', type: 'button', role: 'action', priority: 2, content: 'Shop Now' },
    { id: 'price', type: 'text', role: 'secondary', priority: 2, content: 'Starting at $150' },
    { id: 'logo', type: 'image', role: 'branding', priority: 3, src: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  ]
});

const surfaceList = Object.values(surfaces);

function App() {
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>(surfaceList[0].id);
  const [customW, setCustomW] = useState(400);
  const [customH, setCustomH] = useState(400);
  const [renderer, setRenderer] = useState<'DOM' | 'Canvas'>('DOM');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windowW, setWindowW] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);

  useEffect(() => {
    const handleResize = () => setWindowW(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Derive the active surface profile
  const activeSurface = useMemo(() => {
    if (activeSurfaceId === 'custom') {
      return {
        id: 'custom',
        name: 'Unseen Surface (Live)',
        width: customW,
        height: customH,
        safeArea: { top: 16, right: 16, bottom: 16, left: 16 },
        minTapTarget: 44,
      };
    }
    return surfaces[activeSurfaceId];
  }, [activeSurfaceId, customW, customH]);

  // Resolve layout
  const layout = useMemo(() => resolveLayout(MOCK_AD, activeSurface), [activeSurface]);

  // Effect to render canvas if active
  useEffect(() => {
    if (renderer === 'Canvas' && canvasRef.current) {
      renderToCanvas(canvasRef.current, MOCK_AD, layout);
    }
  }, [renderer, layout]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9fafb'
    }}>
      {/* Minimalist Header */}
      <header style={{
        padding: '1rem 2rem',
        minHeight: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box size={20} color="#111827" />
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
            Adaptive Layout Engine
          </h1>
        </div>
        
        {/* Renderer Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <span style={{ color: '#6b7280', fontWeight: 500, marginRight: '8px' }}>Renderer:</span>
          <div style={{ display: 'flex', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setRenderer('DOM')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: renderer === 'DOM' ? '#ffffff' : 'transparent',
                color: renderer === 'DOM' ? '#111827' : '#6b7280',
                boxShadow: renderer === 'DOM' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              DOM
            </button>
            <button 
              onClick={() => setRenderer('Canvas')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: renderer === 'Canvas' ? '#ffffff' : 'transparent',
                color: renderer === 'Canvas' ? '#111827' : '#6b7280',
                boxShadow: renderer === 'Canvas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Canvas
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Clean Sidebar Controls */}
        <aside className="app-sidebar">
          <div style={{ padding: '2rem 1.5rem' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings2 size={14} /> Known Surfaces
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {surfaceList.map(surface => {
                const isActive = surface.id === activeSurfaceId;
                return (
                  <button
                    key={surface.id}
                    onClick={() => setActiveSurfaceId(surface.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: isActive ? '#f3f4f6' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: isActive ? '#111827' : '#4b5563',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                    onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                      <div style={{ color: isActive ? '#111827' : '#9ca3af' }}>
                        {surface.id.includes('mobile') ? <Smartphone size={18} /> : 
                         surface.id.includes('broadcast') ? <Monitor size={18} /> :
                         <Watch size={18} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{surface.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{surface.width} &times; {surface.height}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Custom Surface Input */}
            <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', margin: '2rem 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={14} /> Unseen Surface (Live)
            </h2>
            <div 
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: activeSurfaceId === 'custom' ? '1px solid #111827' : '1px solid #e5e7eb',
                backgroundColor: activeSurfaceId === 'custom' ? '#f9fafb' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => setActiveSurfaceId('custom')}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Width (px)</label>
                  <input 
                    type="number" 
                    value={customW} 
                    onChange={e => {
                      setCustomW(Number(e.target.value));
                      setActiveSurfaceId('custom');
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>Height (px)</label>
                  <input 
                    type="number" 
                    value={customH} 
                    onChange={e => {
                      setCustomH(Number(e.target.value));
                      setActiveSurfaceId('custom');
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 1.5rem 2rem 1.5rem' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} /> Why this layout?
            </h2>
            
            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {layout.explanations.map((text, i) => (
                <div key={i} style={{ 
                  fontSize: '0.85rem', 
                  color: text.includes('Area insufficient') ? '#dc2626' : '#4b5563',
                  lineHeight: 1.4,
                  display: 'flex',
                  gap: '8px'
                }}>
                  <div style={{ color: '#9ca3af' }}>•</div>
                  <div>
                    {text}
                    {text.includes('Dropped') && (
                      <div style={{ marginTop: '4px', fontWeight: 500, color: '#dc2626' }}>
                        Missing: {layout.droppedElements.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Renderer Canvas */}
        <section className="app-content">
          {/* Subtle dot pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none'
          }} />
          
          <div style={{
            transform: `scale(${Math.min(1, (windowW <= 768 ? windowW - 40 : 800) / activeSurface.width, (windowW <= 768 ? 400 : 600) / activeSurface.height)})`,
            transformOrigin: 'center center',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            zIndex: 2,
            boxShadow: renderer === 'DOM' ? 'none' : '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
          }}>
            {renderer === 'DOM' ? (
              <AdRendererDOM spec={MOCK_AD} layout={layout} />
            ) : (
              <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '12px' }} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
