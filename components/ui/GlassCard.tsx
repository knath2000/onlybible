'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  hover = false,
  onClick
}) => {
  return (
    <div 
      className={`
        glass-card
        bg-[rgba(37,37,66,0.6)]
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        p-6
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
};
