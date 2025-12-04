'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-6 ${className}`}>
      {children}
    </div>
  );
};