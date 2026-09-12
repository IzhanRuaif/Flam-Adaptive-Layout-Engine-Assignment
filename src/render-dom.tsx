import type { FC } from 'react';
import type { AdSpec, AdElement } from './spec';
import type { ResolvedLayout, ElementLayout } from './resolver';

interface AdRendererProps {
  spec: AdSpec;
  layout: ResolvedLayout;
}

export const AdRendererDOM: FC<AdRendererProps> = ({ spec, layout }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: layout.surfaceWidth,
        height: layout.surfaceHeight,
        backgroundColor: '#ffffff',
        color: '#111827',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: '1px solid #e5e7eb',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {layout.elements.map((layoutEl) => {
        const specEl = spec.elements.find((e) => e.id === layoutEl.id);
        if (!specEl) return null;

        return (
          <div
            key={layoutEl.id}
            style={{
              position: 'absolute',
              left: layoutEl.x,
              top: layoutEl.y,
              width: layoutEl.width,
              height: layoutEl.height,
              opacity: layoutEl.opacity,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <ElementContent specEl={specEl} layoutEl={layoutEl} />
          </div>
        );
      })}
    </div>
  );
};

const ElementContent: FC<{ specEl: AdElement; layoutEl: ElementLayout }> = ({
  specEl,
  layoutEl,
}) => {
  if (specEl.type === 'image') {
    return (
      <img
        src={specEl.src}
        alt={specEl.role}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '0px',
          boxShadow: 'none',
          filter: specEl.role === 'branding' ? 'invert(1)' : 'none',
        }}
      />
    );
  }

  if (specEl.type === 'text') {
    return (
      <div
        style={{
          fontSize: layoutEl.fontSize,
          fontFamily: '"Inter", -apple-system, sans-serif',
          fontWeight: specEl.role === 'primary' ? 700 : 400,
          textAlign: layoutEl.textAlign || 'center',
          width: '100%',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: specEl.role === 'primary' ? 2 : 1,
          WebkitBoxOrient: 'vertical',
          letterSpacing: specEl.role === 'primary' ? '-0.02em' : 'normal',
          color: specEl.role === 'primary' ? '#111827' : '#6b7280',
          lineHeight: 1.3,
          padding: '0 8px',
        }}
      >
        {specEl.content}
      </div>
    );
  }

  if (specEl.type === 'button') {
    return (
      <button
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          fontFamily: '"Inter", -apple-system, sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#374151';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#000000';
        }}
      >
        {specEl.content}
      </button>
    );
  }

  return null;
};
