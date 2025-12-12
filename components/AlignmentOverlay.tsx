import React from 'react';

interface AlignmentOverlayProps {
  active: boolean;
  sourceRect: DOMRect | null;
  targetRects: DOMRect[];
  containerRect: DOMRect | null;
}

export const AlignmentOverlay: React.FC<AlignmentOverlayProps> = ({
  active,
  sourceRect,
  targetRects,
  containerRect,
}) => {
  if (!active || !sourceRect || targetRects.length === 0 || !containerRect) {
    return null;
  }

  // Calculate coordinates relative to the container
  const getRelativePoint = (rect: DOMRect, position: 'top' | 'bottom') => {
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = position === 'top' 
      ? rect.top - containerRect.top 
      : rect.bottom - containerRect.top;
    return { x, y };
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10 overflow-visible animate-fade-in"
      width="100%"
      height="100%"
      style={{
        overflow: 'visible',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <defs>
        <linearGradient id="luminous-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e91e63" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#ffc857" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#00bcd4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3f51b5" stopOpacity="0.9" />
        </linearGradient>
        <filter id="luminous-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMorphology operator="dilate" radius="1"/>
          <feColorMatrix type="matrix" values="1 0.8 0 0 0  0 1 0.6 0 0  0 0 1 0 0  0 0 0 1 0"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {targetRects.map((targetRect, index) => {
        const start = getRelativePoint(sourceRect, 'bottom');
        const end = getRelativePoint(targetRect, 'top');

        // Bezier Curve Control Points with more fluid curvature
        const distY = Math.abs(end.y - start.y);
        const cp1 = { x: start.x, y: start.y + distY * 0.4 };
        const cp2 = { x: end.x, y: end.y - distY * 0.4 };

        const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

        return (
          <g key={index}>
            {/* Outer glow path */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#luminous-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              filter="url(#luminous-glow)"
              style={{
                opacity: 0.3,
                animation: 'fadeIn 0.4s ease-out forwards, draw-line 0.8s ease-out forwards',
                animationDelay: `${index * 0.1}s`
              }}
            />
            {/* Main stroke path */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#luminous-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                animation: 'fadeIn 0.4s ease-out forwards, draw-line 0.8s ease-out forwards',
                animationDelay: `${index * 0.1}s`
              }}
            />
          </g>
        );
      })}
    </svg>
  );
};

