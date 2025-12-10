'use client';
import React from 'react';
import { BibleVerse } from '../lib/services/BibleService';
import { useBible } from '../lib/context/BibleContext';
import { translationService } from '../lib/api';
import { WordTranslationTooltip } from './WordTranslationTooltip';
import { AlignmentOverlay } from './AlignmentOverlay';
import { GlassButton } from './ui/GlassButton';
// Note: TTS here remains a lightweight placeholder. Full single-audio
// control lives in SpanishBibleReader; this component focuses on verse
// display, translation, and alignment.

interface VerseItemProps {
  verse: BibleVerse;
}

export const VerseItem: React.FC<VerseItemProps> = ({ verse }) => {
  const { state } = useBible();

  // Local TTS button state (placeholder UI only for now)
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Hovered Spanish word index for alignment
  const [hoveredWord, setHoveredWord] = React.useState<number | null>(null);

  // English KJV text for this specific verse (pulled from TranslationService cache)
  const [englishText, setEnglishText] = React.useState<string | null>(null);

  // Alignment map: Spanish word index -> array of English word indices
  const [alignmentMap, setAlignmentMap] = React.useState<Map<number, number[]>>(
    () => new Map()
  );

  // DOM refs for alignment overlay
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const spanishWordRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const englishWordRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  // Ensure ref arrays are always at least the correct length
  React.useEffect(() => {
    const spanishCount = verse.text.split(' ').length;
    if (spanishWordRefs.current.length !== spanishCount) {
      spanishWordRefs.current = new Array(spanishCount).fill(null);
    }
  }, [verse.text]);

  React.useEffect(() => {
    if (!englishText) return;
    const englishCount = englishText.split(' ').length;
    if (englishWordRefs.current.length !== englishCount) {
      englishWordRefs.current = new Array(englishCount).fill(null);
    }
  }, [englishText]);

  // When global translation toggle is ON, load the cached English verse
  // for this specific reference and compute alignment for hover lines.
  React.useEffect(() => {
    let cancelled = false;

    if (!state.showTranslation) {
      // Hide alignment when translations are hidden
      setAlignmentMap(new Map());
      return;
    }

    const loadEnglishAndAlignment = async () => {
      try {
        const english = await translationService.fetchEnglishVerse(
          verse.book,
          verse.chapter,
          verse.verse
        );
        if (cancelled) return;

        setEnglishText(english.text);

        const map = translationService.computeAlignment(verse.text, english.text);
        if (!cancelled) {
          setAlignmentMap(map);
        }
      } catch (err) {
        console.error('Error loading English verse for alignment:', err);
      }
    };

    loadEnglishAndAlignment();

    return () => {
      cancelled = true;
    };
  }, [state.showTranslation, verse.book, verse.chapter, verse.verse, verse.text]);

  // Compute overlay geometry whenever hovered word or alignment changes
  const overlayProps = React.useMemo(() => {
    if (hoveredWord === null || !containerRef.current) return null;
    if (!alignmentMap.size) return null;

    const sourceEl = spanishWordRefs.current[hoveredWord];
    if (!sourceEl) return null;

    const sourceRect = sourceEl.getBoundingClientRect();
    const targetIndices = alignmentMap.get(hoveredWord) || [];
    const targetRects = targetIndices
      .map((i) => englishWordRefs.current[i]?.getBoundingClientRect())
      .filter((rect): rect is DOMRect => !!rect);

    if (!targetRects.length) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      sourceRect,
      targetRects,
      containerRect,
    };
  }, [hoveredWord, alignmentMap]);

  const spanishWords = React.useMemo(() => verse.text.split(' '), [verse.text]);
  const englishWords = React.useMemo(
    () => (englishText ? englishText.split(' ') : []),
    [englishText]
  );

  // Simplified per-verse TTS click handler (visual feedback only for now)
  const handleTTS = async () => {
    if (!verse.text) return;
    setIsPlaying(true);
    // Intentionally not wiring to /api/tts here to avoid
    // duplicating global audio control logic. This keeps
    // per-verse button as a lightweight affordance until
    // shared TTS control is refactored.
    setTimeout(() => setIsPlaying(false), 500);
  };

  return (
    <div className="relative group" ref={containerRef}>
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
          <React.Fragment key={index}>
            <WordTranslationTooltip
              word={word}
              onHover={() => setHoveredWord(index)}
              onHoverEnd={() => setHoveredWord(null)}
            >
              <span
                ref={(el) => {
                  spanishWordRefs.current[index] = el;
                }}
                className="cursor-help underline underline-offset-2 decoration-gold-400"
              >
                {word}
              </span>
            </WordTranslationTooltip>
            {' '}
          </React.Fragment>
        ))}
      </p>

      {/* English verse (KJV) when global translation toggle is on */}
      {state.showTranslation && englishText && (
        <p className="text-sm text-gray-300 leading-relaxed mt-1">
          {englishWords.map((word, index) => (
            <React.Fragment key={index}>
              <span
                ref={(el) => {
                  englishWordRefs.current[index] = el;
                }}
                className="text-gray-300"
              >
                {word}
              </span>
              {' '}
            </React.Fragment>
          ))}
        </p>
      )}

      {/* Alignment Overlay on Hover */}
      {overlayProps && (
        <AlignmentOverlay
          active={true}
          sourceRect={overlayProps.sourceRect}
          targetRects={overlayProps.targetRects}
          containerRect={overlayProps.containerRect}
        />
      )}
    </div>
  );
};
