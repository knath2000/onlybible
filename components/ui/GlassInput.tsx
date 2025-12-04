'use client';

import React from 'react';

interface GlassInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  type = 'text'
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2
        focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40
        transition-all duration-200 ${className}`}
    />
  );
};