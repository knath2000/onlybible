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
      className="absolute inset-0 pointer-events-none z-10 overflow-visible"
      width="100%"
      height="100%"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffc857" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f5a623" stopOpacity="0.8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {targetRects.map((targetRect, index) => {
        const start = getRelativePoint(sourceRect, 'bottom');
        const end = getRelativePoint(targetRect, 'top');
        
        // Bezier Curve Control Points
        // Vertical distance to curve
        const distY = Math.abs(end.y - start.y);
        const cp1 = { x: start.x, y: start.y + distY * 0.5 };
        const cp2 = { x: end.x, y: end.y - distY * 0.5 };

        const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

        return (
          <path
            key={index}
            d={pathData}
            fill="none"
            stroke="url(#gold-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#glow)"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 0,
              animation: 'draw-line 0.6s ease-out forwards',
              opacity: 0.8
            }}
          />
        );
      })}
    </svg>
  );
};

