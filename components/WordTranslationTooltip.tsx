'use client';

import React, { useState } from 'react';
import { useBible } from '../lib/context/BibleContext';

interface WordTranslationTooltipProps {
  word: string;
  children: React.ReactNode;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export const WordTranslationTooltip: React.FC<WordTranslationTooltipProps> = ({ word, children, onHover, onHoverEnd }) => {
  const { translateWord } = useBible();
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = async () => {
    if (word.trim().length === 0) return;

    setIsLoading(true);
    setShowTooltip(true);
    onHover?.();

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
    onHoverEnd?.();
    // Small delay to allow click interaction
    setTimeout(() => {
      setTranslation(null);
    }, 200);
  };

  // Clean the word for display (remove punctuation for comparison)
  const cleanWord = word.replace(/[.,;:!?¿¡"'()]/g, '');
  const isDifferent = translation && translation.toLowerCase() !== cleanWord.toLowerCase();

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showTooltip && (
        <div
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-3 animate-fade-in"
          style={{
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div className="liquid-border elevation-mid rounded-lg px-3 py-2 shadow-xl min-w-[140px] text-center whitespace-nowrap relative overflow-hidden">
            {/* Subtle inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-lg" />

            <div className="relative">
              {isLoading ? (
                <div className="text-white/70 text-sm">Traduciendo...</div>
              ) : translation ? (
                <div className="text-sm leading-tight">
                  <span className="text-white font-medium">{cleanWord}</span>
                  {isDifferent && (
                    <>
                      <span className="text-white/50 mx-1.5 text-xs">→</span>
                      <span className="text-gold-light font-semibold">{translation}</span>
                    </>
                  )}
                  {!isDifferent && (
                    <span className="text-white/40 ml-2 text-xs italic">(igual)</span>
                  )}
                </div>
              ) : (
                <div className="text-white/50 text-sm">Sin traducción</div>
              )}
            </div>

            {/* Enhanced tooltip arrow with liquid glass effect */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="w-3 h-3 bg-inherit border-r border-b border-white/10 transform rotate-45 translate-y-[-50%] translate-x-[-50%]" />
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-white/20 to-transparent transform rotate-45 translate-y-[-50%] translate-x-[-50%] rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};
