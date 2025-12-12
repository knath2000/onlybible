'use client';

import React from 'react';

interface GlassButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'gold' | 'outline' | 'ghost' | 'liquid';
  size?: 'sm' | 'md' | 'lg';
  elevation?: 'low' | 'mid' | 'high';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'default',
  size = 'md',
  elevation = 'mid',
  icon,
  iconRight
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    backdrop-blur-sm rounded-xl
    font-medium
    transition-all duration-300
    btn-shine
  `;

  const variantStyles = {
    default: `
      bg-white/10 border border-white/20
      text-white
      hover:bg-white/20 hover:border-white/30
    `,
    gold: `
      bg-gradient-to-r from-[#f5a623] to-[#d4900d]
      text-white
      border border-[#ffc857]/30
      hover:from-[#ffc857] hover:to-[#f5a623]
      shadow-[0_4px_20px_rgba(245,166,35,0.3)]
      hover:shadow-[0_6px_25px_rgba(245,166,35,0.4)]
    `,
    outline: `
      bg-transparent border-2 border-[#f5a623]
      text-[#f5a623]
      hover:bg-[#f5a623]/10
    `,
    ghost: `
      bg-transparent border-none
      text-white/80
      hover:text-white hover:bg-white/10
    `,
    liquid: `
      liquid-border
      text-white
      hover:text-white
    `
  };

  const elevationClasses = {
    low: 'liquid-surface-low',
    mid: '',
    high: 'liquid-surface-high'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${variant === 'liquid' ? elevationClasses[elevation] : ''}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer focus-ring'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};
