'use client';

import React from 'react';

interface GlassInputProps {
  value?: string | number;
  onChange?: (value: any) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  label?: string;
  children?: React.ReactNode;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  type = 'text',
  label,
  children
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm text-white/60 mb-2">{label}</label>
      )}
      {children ? (
        <div className={`
          w-full
          bg-white/5 
          backdrop-blur-sm 
          border border-white/20 
          rounded-xl 
          px-4 py-3
          text-white
          focus-within:border-[#f5a623] 
          focus-within:ring-1 
          focus-within:ring-[#f5a623]/30
          transition-all duration-200 
        `}>
          {children}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full
            bg-white/5 
            backdrop-blur-sm 
            border border-white/20 
            rounded-xl 
            px-4 py-3
            text-white
            placeholder:text-white/40
            focus:outline-none 
            focus:border-[#f5a623] 
            focus:ring-1 
            focus:ring-[#f5a623]/30
            transition-all duration-200 
          `}
        />
      )}
    </div>
  );
};
