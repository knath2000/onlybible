'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { GlassCard, GlassButton } from './ui';
import { LoadingSpinner } from './LoadingSpinner';
import { VerseItem } from './VerseItem';
import { BibleVerse } from '../lib/services/BibleService';

export const InfiniteVerseList: React.FC = () => {
  const {
    state,
    loadNextVerses
  } = useBible();

  // Determine which verse is currently being viewed (for emphasis)
  const currentVerseKey = `${state.currentBook}-${state.currentChapter}-${state.currentVerse}`;
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state.hasNextPage && !state.isFetchingNextPage) {
          loadNextVerses();
        }
      },
      { rootMargin: '200px' } // Load before reaching bottom
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [state.hasNextPage, state.isFetchingNextPage, loadNextVerses]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="space-y-6 pb-20 scroll-smooth">
        {state.infiniteVerses.map((verse: BibleVerse) => {
          const verseKey = `${verse.book}-${verse.chapter}-${verse.verse}`;
          const isCurrentVerse = verseKey === currentVerseKey;

          return (
            <>
              <a id={`${verse.book}${verse.chapter}:${verse.verse}`} className="sr-only" />
              <GlassCard
                key={verseKey}
                variant="liquid"
                elevation={isCurrentVerse ? "high" : "mid"}
                className={`p-6 transition-all duration-500 ${
                  isCurrentVerse ? 'ring-2 ring-gold/50 shadow-gold-glow' : ''
                }`}
              >
                <VerseItem verse={verse} isCurrentVerse={isCurrentVerse} />
              </GlassCard>
            </>
          );
        })}

        {state.isFetchingNextPage && (
          <div className="flex justify-center p-4" role="status" aria-live="polite" aria-label="Loading more verses">
            <LoadingSpinner />
          </div>
        )}

        {/* Sentinel for IntersectionObserver */}
        <div ref={sentinelRef} className="h-4" />
        
        {!state.hasNextPage && state.infiniteVerses.length > 0 && (
          <div className="text-center text-gray-400 p-4" role="status" aria-live="polite" aria-label="End of chapter">
            Fin del Capítulo
          </div>
        )}
      </div>

      {scrolled && (
        <GlassButton 
          className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg" 
          onClick={scrollToTop}
        >
          ↑
        </GlassButton>
      )}
    </>
  );
};
