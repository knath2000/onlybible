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
      <div className="space-y-4 pb-20 scroll-smooth">
        {state.infiniteVerses.map((verse: BibleVerse) => (
          <>
            <a id={`${verse.book}${verse.chapter}:${verse.verse}`} className="sr-only" />
            <GlassCard key={`${verse.book}-${verse.chapter}-${verse.verse}`} className="p-6">
              <VerseItem verse={verse} />
            </GlassCard>
          </>
        ))}

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
