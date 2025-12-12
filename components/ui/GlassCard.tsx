'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'liquid';
  elevation?: 'low' | 'mid' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  variant = 'default',
  elevation = 'mid'
}) => {
  const baseClasses = `
    backdrop-blur-xl
    rounded-2xl
    p-6
    transition-all duration-300
    ${hover ? 'card-hover cursor-pointer focus-ring' : ''}
  `;

  const variantClasses = {
    default: 'glass-card',
    liquid: 'liquid-surface'
  };

  const elevationClasses = {
    low: 'liquid-surface-low',
    mid: '',
    high: 'liquid-surface-high'
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${variant === 'liquid' ? elevationClasses[elevation] : ''}
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
