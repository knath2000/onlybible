'use client';
import React from 'react';
import { BibleVerse } from '../lib/services/BibleService';
import { useBible } from '../lib/context/BibleContext';
import { WordTranslationTooltip } from './WordTranslationTooltip';
import { AlignmentOverlay } from './AlignmentOverlay'; // Assume existing or placeholder
import { GlassButton } from './ui/GlassButton';
// Assume TTS logic (simplified)

interface VerseItemProps {
  verse: BibleVerse;
}

export const VerseItem: React.FC<VerseItemProps> = ({ verse }) => {
  const { state, toggleTranslation, translateWord } = useBible();
  const [isPlaying, setIsPlaying] = React.useState(false); // For TTS
  const [hoveredWord, setHoveredWord] = React.useState<number | null>(null);

  // Simplified TTS (reuse existing audio logic)
  const handleTTS = async () => {
    if (!verse.text) return;
    setIsPlaying(true);
    // Call /api/tts or existing service
    // await playAudio(verse.text);
    setTimeout(() => setIsPlaying(false), 5000); // Placeholder
  };

  // For alignment, assume computeAlignment from TranslationService
  // const alignment = state.alignmentMap?.get(`${verse.chapter}:${verse.verse}`) || new Map();

  const spanishWords = verse.text.split(' ');

  return (
    <div className="relative group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm text-gray-400 font-medium">
          {verse.chapter}:{verse.verse}
        </span>
        <GlassButton onClick={handleTTS} disabled={isPlaying} className="text-xs">
          {isPlaying ? '🔊' : '🔈'}
        </GlassButton>
      </div>

      {/* Spanish Text with Tooltips */}
      <p className="text-lg leading-relaxed text-gray-100 mb-2">
        {spanishWords.map((word, index) => (
          <WordTranslationTooltip
            key={index}
            word={word}
            onHover={() => setHoveredWord(index)}
            onHoverEnd={() => setHoveredWord(null)}
          >
            <span className="cursor-help underline underline-offset-2 decoration-gold-400">
              {word}
            </span>
          </WordTranslationTooltip>
        ))}
      </p>

      {/* Translation Toggle */}
      {state.showTranslation && (
        <div className="text-sm text-gray-300 leading-relaxed">
          {/* Assume englishText from state or verse */}
          {verse.text /* Placeholder: replace with english */}
        </div>
      )}

      {/* Alignment Overlay on Hover */}
      {hoveredWord !== null && (
        <AlignmentOverlay
          active={false}
          sourceRect={null}
          targetRects={[]}
          containerRect={null}
        />
      )}
    </div>
  );
};
