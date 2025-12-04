'use client';

import React, { useState, useEffect } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { GlassCard, GlassButton } from './ui';
import { LoadingSpinner } from './LoadingSpinner';
import { WordTranslationTooltip } from './WordTranslationTooltip';

interface BibleError {
  error: string;
  details?: string;
  bibleId?: string;
  passage?: string;
  status?: number;
}

type ViewMode = 'home' | 'reader' | 'settings';

export const SpanishBibleReader: React.FC = () => {
  const {
    state,
    fetchVerse,
    translateVerse,
    setBook,
    setChapter,
    setVerse,
    setTranslationMode
  } = useBible();

  const [error, setError] = useState<BibleError | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [verseOfDay, setVerseOfDay] = useState<{ book: string; chapter: number; verse: number } | null>(null);

  // Generate a "verse of the day" based on the date
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Popular verses to cycle through
    const popularVerses = [
      { book: 'Juan', chapter: 3, verse: 16 },
      { book: 'Salmos', chapter: 23, verse: 1 },
      { book: 'Génesis', chapter: 1, verse: 1 },
      { book: 'Romanos', chapter: 8, verse: 28 },
      { book: 'Filipenses', chapter: 4, verse: 13 },
      { book: 'Isaías', chapter: 41, verse: 10 },
      { book: 'Proverbios', chapter: 3, verse: 5 },
      { book: 'Mateo', chapter: 6, verse: 33 },
      { book: 'Salmos', chapter: 46, verse: 1 },
      { book: 'Jeremías', chapter: 29, verse: 11 },
    ];
    
    const verseIndex = dayOfYear % popularVerses.length;
    setVerseOfDay(popularVerses[verseIndex]);
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bible-app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setTranslationMode(parsed.translationMode || 'verse');
    }
  }, []);

  // Fetch verse of the day
  useEffect(() => {
    if (verseOfDay && viewMode === 'home') {
      fetchVerse(verseOfDay.book, verseOfDay.chapter, verseOfDay.verse).catch((err) => {
        console.error('Failed to fetch verse of the day:', err);
        setError({
          error: 'No se pudo cargar el versículo del día',
          details: err.message || 'Error desconocido',
        });
      });
    }
  }, [verseOfDay, viewMode]);

  // Fetch verse when in reader mode
  useEffect(() => {
    if (viewMode === 'reader' && state.currentBook && state.currentChapter && state.currentVerse) {
      fetchVerse(state.currentBook, state.currentChapter, state.currentVerse).catch((err) => {
        console.error('Failed to fetch verse:', err);
        setError({
          error: 'No se pudo cargar el versículo',
          details: err.message || 'Error desconocido',
          bibleId: 'RVR60',
          passage: `${state.currentBook} ${state.currentChapter}:${state.currentVerse}`
        });
      });
    }
  }, [state.currentBook, state.currentChapter, state.currentVerse, viewMode]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBook(e.target.value);
    setChapter(1);
    setVerse(1);
    setError(null);
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChapter(parseInt(e.target.value));
    setVerse(1);
    setError(null);
  };

  const handleVerseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVerse(parseInt(e.target.value));
    setError(null);
  };

  const handleTranslate = async () => {
    try {
      await translateVerse();
      setError(null);
    } catch (err) {
      console.error('Failed to translate verse:', err);
      setError({
        error: 'Error al traducir',
        details: err instanceof Error ? err.message : 'Error desconocido'
      });
    }
  };

  const handleNextVerse = () => {
    setVerse(state.currentVerse + 1);
  };

  const handlePrevVerse = () => {
    if (state.currentVerse > 1) {
      setVerse(state.currentVerse - 1);
    }
  };

  const openBibleReader = () => {
    setViewMode('reader');
  };

  const goHome = () => {
    setViewMode('home');
  };

  // Decorative Diamond Icon
  const DiamondIcon = () => (
    <span className="text-[#f5a623] text-xl animate-pulse-gold">✦</span>
  );

  // Home View
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-[family-name:var(--font-playfair)] italic text-5xl sm:text-6xl md:text-7xl text-gold-gradient mb-6">
            Palabra Luminosa
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Explora las hermosas palabras de la Biblia con{' '}
            <span className="text-[#f5a623] font-medium">aprendizaje interactivo</span>
            {' '}y{' '}
            <span className="text-[#f5a623] font-medium">experiencias encantadoras</span>
          </p>
        </div>

        {/* Decorative Divider */}
        <div className="divider-elegant w-full max-w-md mb-12">
          <DiamondIcon />
        </div>

        {/* Verse of the Day */}
        <div className="w-full max-w-2xl mb-12 animate-fade-in-up">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Versículo del Día
          </h2>
          
          <GlassCard className="min-h-[200px] flex flex-col items-center justify-center">
            {state.isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <span className="text-white/60">Cargando el versículo del día...</span>
              </div>
            ) : error ? (
              <div className="text-center">
                <p className="text-red-400 mb-2">{error.error}</p>
                <GlassButton 
                  onClick={() => verseOfDay && fetchVerse(verseOfDay.book, verseOfDay.chapter, verseOfDay.verse)}
                  variant="outline"
                  size="sm"
                >
                  Reintentar
                </GlassButton>
              </div>
            ) : (
              <div className="text-center">
                {verseOfDay && (
                  <p className="text-[#f5a623] text-sm mb-3 font-medium">
                    {verseOfDay.book} {verseOfDay.chapter}:{verseOfDay.verse}
                  </p>
                )}
                <p className="text-white/90 text-lg sm:text-xl leading-relaxed italic font-[family-name:var(--font-playfair)]">
                  "{state.verseText}"
                </p>
                {state.showTranslation && state.translatedText && (
                  <p className="text-white/60 text-base mt-4 border-t border-white/10 pt-4">
                    {state.translatedText}
                  </p>
                )}
                <div className="mt-6 flex gap-3 justify-center">
                  <GlassButton onClick={handleTranslate} variant="ghost" size="sm">
                    {state.isTranslating ? (
                      <LoadingSpinner size="sm" />
                    ) : state.showTranslation ? (
                      'Ocultar Traducción'
                    ) : (
                      '🌐 Traducir'
                    )}
                  </GlassButton>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Navigation Cards */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl animate-fade-in-up">
          <GlassCard 
            hover 
            className="flex-1 text-center py-6 cursor-pointer"
            onClick={() => setViewMode('settings')}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">⚙️</span>
              <h3 className="text-[#f5a623] text-xl font-semibold">Ajustes</h3>
              <span className="text-xl">⚙️</span>
            </div>
            <p className="text-white/60 text-sm">Configura tus preferencias</p>
          </GlassCard>

          <GlassCard 
            hover 
            className="flex-1 text-center py-6 cursor-pointer"
            onClick={openBibleReader}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">📖</span>
              <h3 className="text-[#f5a623] text-xl font-semibold">Abrir Biblia</h3>
              <span className="text-xl">✨</span>
            </div>
            <p className="text-white/60 text-sm">Explora capítulos y versículos</p>
          </GlassCard>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-sm mt-12">
          Reina-Valera 1960 • KJV
        </p>
      </div>
    );
  }

  // Settings View
  if (viewMode === 'settings') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <button 
            onClick={goHome}
            className="text-[#f5a623] mb-6 flex items-center gap-2 hover:text-[#ffc857] transition-colors"
          >
            ← Volver al inicio
          </button>

          <h1 className="font-[family-name:var(--font-playfair)] italic text-4xl text-gold-gradient mb-8">
            Ajustes
          </h1>

          <GlassCard className="mb-6">
            <h3 className="text-white font-semibold mb-4">Modo de Traducción</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="translationMode" 
                  value="verse"
                  checked={state.translationMode === 'verse'}
                  onChange={() => setTranslationMode('verse')}
                  className="w-4 h-4 accent-[#f5a623]"
                />
                <span className="text-white/80">Traducción de versículo completo</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="translationMode" 
                  value="word"
                  checked={state.translationMode === 'word'}
                  onChange={() => setTranslationMode('word')}
                  className="w-4 h-4 accent-[#f5a623]"
                />
                <span className="text-white/80">Traducción palabra por palabra</span>
              </label>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-white font-semibold mb-4">Información</h3>
            <div className="space-y-2 text-white/60 text-sm">
              <p>📖 Biblia en Español: Reina-Valera 1960</p>
              <p>🌐 Traducción al Inglés: King James Version</p>
              <p>✨ Toca cualquier palabra para ver su traducción</p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Bible Reader View
  return (
    <div className="min-h-screen relative">
      {/* Floating Back Button */}
      <button 
        onClick={goHome}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-[rgba(37,37,66,0.8)] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-[rgba(37,37,66,0.95)] transition-all shadow-lg"
        aria-label="Volver al inicio"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      {/* Gold Scrollbar Indicator */}
      <div className="fixed right-2 top-1/4 bottom-1/4 w-1.5 rounded-full bg-white/10 z-40">
        <div className="w-full h-1/3 rounded-full bg-gradient-to-b from-[#ffc857] to-[#f5a623]" />
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Header with Chapter Selector */}
        <div className="text-center mb-8 pt-4">
          <h1 className="font-[family-name:var(--font-playfair)] italic text-3xl text-gold-gradient mb-4">
            {state.currentBook}
          </h1>
          
          {/* Chapter Navigation */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button 
              onClick={() => state.currentChapter > 1 && setChapter(state.currentChapter - 1)}
              disabled={state.currentChapter <= 1}
              className="text-white/40 hover:text-white disabled:opacity-30 transition-colors"
            >
              ◀
            </button>
            <select
              value={state.currentChapter}
              onChange={handleChapterChange}
              className="bg-transparent text-[#f5a623] text-xl font-semibold focus:outline-none cursor-pointer text-center appearance-none"
            >
              {state.chapters.map((chapter) => (
                <option key={chapter} value={chapter} className="bg-[#1a1a2e]">
                  Capítulo {chapter}
                </option>
              ))}
            </select>
            <button 
              onClick={() => setChapter(state.currentChapter + 1)}
              disabled={state.currentChapter >= state.chapters.length}
              className="text-white/40 hover:text-white disabled:opacity-30 transition-colors"
            >
              ▶
            </button>
          </div>

          {/* Book Selector */}
          <select
            value={state.currentBook}
            onChange={handleBookChange}
            className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white/80 text-sm focus:border-[#f5a623] focus:outline-none transition-colors"
          >
            {state.books.map((book) => (
              <option key={book} value={book} className="bg-[#1a1a2e]">{book}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-center">
            <p className="text-red-300 mb-2">{error.error}</p>
            <GlassButton onClick={() => setError(null)} variant="ghost" size="sm">
              Cerrar
            </GlassButton>
          </div>
        )}

        {/* Verse Cards */}
        <div className="space-y-4">
          {/* Current Verse Card */}
          <GlassCard className="overflow-hidden">
            {state.isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <LoadingSpinner size="lg" />
                <span className="text-white/60">Cargando versículo...</span>
              </div>
            ) : (
              <div className="text-center">
                {/* Verse Number */}
                <p className="text-[#f5a623] text-xl font-semibold mb-6">
                  {state.currentChapter}:{state.currentVerse}
                </p>

                {/* Spanish Verse Text - Large and Centered */}
                <div className="mb-6">
                  <p className="text-white text-2xl sm:text-3xl leading-relaxed font-[family-name:var(--font-playfair)]">
                    {state.verseText.split(' ').map((word, index) => (
                      <WordTranslationTooltip key={index} word={word}>
                        <span className="inline hover:text-[#f5a623] transition-colors cursor-pointer">
                          {word}{' '}
                        </span>
                      </WordTranslationTooltip>
                    ))}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

                {/* Transliteration/Reference in Gold Italic */}
                <p className="text-[#f5a623] italic text-lg mb-4 font-[family-name:var(--font-playfair)]">
                  {state.currentBook} {state.currentChapter}:{state.currentVerse} — Reina-Valera 1960
                </p>

                {/* English Translation */}
                {state.showTranslation && state.translatedText && !state.isTranslating && (
                  <>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                    <p className="text-white/80 text-lg leading-relaxed">
                      {state.translatedText}
                    </p>
                  </>
                )}

                {/* Translation Loading */}
                {state.isTranslating && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <LoadingSpinner size="sm" />
                    <span className="text-white/60">Cargando traducción...</span>
                  </div>
                )}

                {/* Translate Button */}
                {!state.showTranslation && !state.isTranslating && (
                  <button 
                    onClick={handleTranslate}
                    className="mt-4 text-[#f5a623]/70 hover:text-[#f5a623] text-sm transition-colors"
                  >
                    🌐 Ver traducción al inglés
                  </button>
                )}

                {state.showTranslation && !state.isTranslating && (
                  <button 
                    onClick={handleTranslate}
                    className="mt-4 text-white/40 hover:text-white/60 text-sm transition-colors"
                  >
                    Ocultar traducción
                  </button>
                )}
              </div>
            )}
          </GlassCard>

          {/* Verse Navigation */}
          <div className="flex justify-center gap-4 pt-4">
            <GlassButton 
              onClick={handlePrevVerse} 
              disabled={state.currentVerse <= 1}
              variant="default"
              className="flex-1 max-w-[150px]"
            >
              ← Anterior
            </GlassButton>
            
            {/* Verse Selector */}
            <select
              value={state.currentVerse}
              onChange={handleVerseChange}
              className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-[#f5a623] focus:border-[#f5a623] focus:outline-none transition-colors text-center"
              disabled={state.verses.length === 0}
            >
              {state.verses.map((verse) => (
                <option key={verse} value={verse} className="bg-[#1a1a2e]">
                  Vers. {verse}
                </option>
              ))}
            </select>

            <GlassButton 
              onClick={handleNextVerse} 
              disabled={state.currentVerse >= state.verses.length}
              variant="default"
              className="flex-1 max-w-[150px]"
            >
              Siguiente →
            </GlassButton>
          </div>
        </div>

        {/* Footer Tip */}
        <p className="text-center text-white/30 text-sm mt-8">
          ✨ Toca cualquier palabra para ver su traducción
        </p>
      </div>

      {/* Settings Button - Fixed */}
      <button 
        onClick={() => setViewMode('settings')}
        className="fixed right-4 top-4 z-50 w-10 h-10 rounded-full bg-[rgba(37,37,66,0.8)] backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
        aria-label="Ajustes"
      >
        ⚙️
      </button>
    </div>
  );
};
