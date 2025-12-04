'use client';

import React, { useState } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { GlassCard } from './ui';

interface WordTranslationTooltipProps {
  word: string;
  children: React.ReactNode;
}

export const WordTranslationTooltip: React.FC<WordTranslationTooltipProps> = ({ word, children }) => {
  const { translateWord } = useBible();
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = async () => {
    if (word.trim().length === 0) return;

    setIsLoading(true);
    setShowTooltip(true);

    try {
      const translated = await translateWord(word);
      setTranslation(translated);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    // Small delay to allow click interaction
    setTimeout(() => {
      setTranslation(null);
    }, 200);
  };

  return (
    <span
      className="relative inline-block cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <GlassCard className="p-2 text-sm min-w-[120px] text-center">
            {isLoading ? (
              <div className="text-white/80">Traduciendo...</div>
            ) : translation ? (
              <div className="text-white">
                <span className="font-medium">{word}</span> → <span className="text-blue-300">{translation}</span>
              </div>
            ) : (
              <div className="text-white/60">No translation available</div>
            )}
          </GlassCard>
        </div>
      )}
    </span>
  );
};