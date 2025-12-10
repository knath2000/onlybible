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
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 animate-fade-in"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div className="bg-[#1a1a2e] border border-[#f5a623]/30 rounded-xl px-4 py-2 shadow-lg shadow-black/30 min-w-[120px] text-center whitespace-nowrap">
            {isLoading ? (
              <div className="text-white/60 text-sm">Traduciendo...</div>
            ) : translation ? (
              <div className="text-sm">
                <span className="text-white/80">{cleanWord}</span>
                {isDifferent && (
                  <>
                    <span className="text-white/40 mx-2">→</span>
                    <span className="text-[#f5a623] font-medium">{translation}</span>
                  </>
                )}
                {!isDifferent && (
                  <span className="text-white/50 ml-2">(same)</span>
                )}
              </div>
            ) : (
              <div className="text-white/40 text-sm">Sin traducción</div>
            )}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-[#1a1a2e]" />
            </div>
          </div>
        </div>
      )}
    </span>
  );
};
