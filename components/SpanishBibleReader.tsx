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
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={goHome}
            className="text-[#f5a623] flex items-center gap-2 hover:text-[#ffc857] transition-colors"
          >
            ← Inicio
          </button>
          <h1 className="font-[family-name:var(--font-playfair)] italic text-2xl text-gold-gradient">
            Palabra Luminosa
          </h1>
          <button 
            onClick={() => setViewMode('settings')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ⚙️
          </button>
        </div>

        {/* Navigation Card */}
        <GlassCard className="mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
              <h3 className="text-red-300 font-semibold mb-2">Error: {error.error}</h3>
              {error.details && (
                <p className="text-red-200 text-sm mb-2">Detalles: {error.details}</p>
              )}
              <GlassButton onClick={() => setError(null)} variant="ghost" size="sm">
                Cerrar
              </GlassButton>
            </div>
          )}

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-white/60 mb-2">Libro</label>
              <select
                value={state.currentBook}
                onChange={handleBookChange}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#f5a623] focus:outline-none transition-colors"
              >
                {state.books.map((book) => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Capítulo</label>
              <select
                value={state.currentChapter}
                onChange={handleChapterChange}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#f5a623] focus:outline-none transition-colors"
                disabled={state.chapters.length === 0}
              >
                {state.chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Versículo</label>
              <select
                value={state.currentVerse}
                onChange={handleVerseChange}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#f5a623] focus:outline-none transition-colors"
                disabled={state.verses.length === 0}
              >
                {state.verses.map((verse) => (
                  <option key={verse} value={verse}>{verse}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <GlassButton 
              onClick={handlePrevVerse} 
              disabled={state.currentVerse <= 1}
              variant="default"
            >
              ← Anterior
            </GlassButton>
            <GlassButton onClick={handleNextVerse} variant="default">
              Siguiente →
            </GlassButton>
            <GlassButton 
              onClick={handleTranslate} 
              variant="gold"
              disabled={state.isTranslating}
            >
              {state.isTranslating ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Traduciendo...</span>
                </>
              ) : state.showTranslation ? (
                'Ocultar Traducción'
              ) : (
                '🌐 Traducir al Inglés'
              )}
            </GlassButton>
          </div>
        </GlassCard>

        {/* Verse Display Card */}
        <GlassCard>
          {state.isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
              <LoadingSpinner size="lg" />
              <span className="text-white/60">Cargando versículo...</span>
            </div>
          ) : (
            <>
              {/* Spanish Verse */}
              <div className="mb-6">
                <h2 className="text-[#f5a623] font-semibold text-lg mb-4">
                  {state.currentBook} {state.currentChapter}:{state.currentVerse}
                </h2>
                <p className="text-white text-xl leading-relaxed">
                  {state.verseText.split(' ').map((word, index) => (
                    <WordTranslationTooltip key={index} word={word}>
                      <span className="inline-block mx-0.5 hover:text-[#f5a623] transition-colors cursor-pointer">
                        {word}
                      </span>
                    </WordTranslationTooltip>
                  ))}
                </p>
              </div>

              {/* Translation Loading */}
              {state.isTranslating && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="sm" />
                    <span className="text-white/60">Cargando traducción al inglés (KJV)...</span>
                  </div>
                </div>
              )}

              {/* English Translation */}
              {state.showTranslation && state.translatedText && !state.isTranslating && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white/60 text-sm font-medium mb-2">
                    English (KJV - King James Version)
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed italic">
                    {state.translatedText}
                  </p>
                </div>
              )}
            </>
          )}
        </GlassCard>

        {/* Tip */}
        <p className="text-center text-white/40 text-sm mt-6">
          💡 Toca cualquier palabra en español para ver su traducción
        </p>
      </div>
    </div>
  );
};
