'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { bibleService, translationService } from '../lib/api';
import { GlassCard, GlassButton, GlassInput } from './ui';
import { LoadingSpinner } from './LoadingSpinner';
import { WordTranslationTooltip } from './WordTranslationTooltip';
import { AlignmentOverlay } from './AlignmentOverlay';
import { SettingsPanel } from './SettingsPanel';
import { SearchPanel } from './SearchPanel';
import { InfiniteVerseList } from './InfiniteVerseList';

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
    setTranslationMode,
    toggleTranslation,
    loadNextVerses
  } = useBible();

  // Alignment State
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spanishWordRefs = useRef<(HTMLElement | null)[]>([]);
  const englishWordRefs = useRef<(HTMLElement | null)[]>([]);

  // Calculate alignment map
  const alignmentMap = useMemo(() => {
    if (!state.verseText || !state.translatedText) return new Map<number, number[]>();
    return translationService.computeAlignment(state.verseText, state.translatedText);
  }, [state.verseText, state.translatedText]);

  // Reset refs when text changes
  useEffect(() => {
    if (state.verseText) {
      spanishWordRefs.current = new Array(state.verseText.split(' ').length).fill(null);
    }
    if (state.translatedText) {
      englishWordRefs.current = new Array(state.translatedText.split(' ').length).fill(null);
    }
  }, [state.verseText, state.translatedText]);

  const [error, setError] = useState<BibleError | null>(null);
  // const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [verseOfDay, setVerseOfDay] = useState<{ book: string; chapter: number; verse: number } | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplayRunning, setIsAutoplayRunning] = useState(false);
  const [autoplayTarget, setAutoplayTarget] = useState<{ book: string; chapter: number; verse: number } | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const autoplayRunningRef = useRef(false);
  const lastAutoplayPlayedRef = useRef<string | null>(null);

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
    const autoplayPref = localStorage.getItem('bible-app-autoplay-enabled');
    if (autoplayPref !== null) {
      setAutoplayEnabled(autoplayPref === 'true');
    }
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const result = await bibleService.testConnection();
      setConnectionTestResult(result);
    } catch (error) {
      setConnectionTestResult({ success: false, message: 'Test failed' });
    }
    setIsTestingConnection(false);
  };

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

  const getOverlayProps = () => {
    if (hoveredWordIndex === null || !containerRef.current) return null;
    
    const spanishEl = spanishWordRefs.current[hoveredWordIndex];
    if (!spanishEl) return null;

    const spanishRect = spanishEl.getBoundingClientRect();
    const targetIndices = alignmentMap.get(hoveredWordIndex) || [];
    
    const targetRects = targetIndices
      .map(i => englishWordRefs.current[i]?.getBoundingClientRect())
      .filter((r): r is DOMRect => !!r);
      
    if (targetRects.length === 0) return null;
    
    return {
      active: true,
      sourceRect: spanishRect,
      targetRects,
      containerRect: containerRef.current.getBoundingClientRect()
    };
  };

  const overlayProps = getOverlayProps();

  // Cleanup audio object URLs on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handlePlayAudio = async (textOverride?: string) => {
    const audioText = textOverride || state.verseText;
    if (!audioText) return;

    // Stop any currently playing audio before starting a new one
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore pause errors
      }
    }

    setIsTtsLoading(true);
    setIsPlaying(false);
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(audioText)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        // If TTS is not configured on the server, surface a clear,
        // user-friendly message instead of a generic failure.
        if (data && data.configured === false) {
          console.warn('TTS is not configured on this deployment:', data);
          setError({
            error: 'Audio no disponible',
            details:
              'La función de audio no está configurada en este entorno. Pide al administrador que configure TTS_API_KEY y TTS_REGION.',
          });
          return;
        }

        throw new Error(data.error || 'No se pudo generar audio');
      }
      const blob = await res.blob();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlaying(false);
        if (autoplayEnabled) {
          // If autoplay preference is enabled, automatically advance to next verse
          if (!isAutoplayRunning) {
            // Start autoplay sequence
            setIsAutoplayRunning(true);
            setAutoplayTarget({
              book: state.currentBook,
              chapter: state.currentChapter,
              verse: state.currentVerse
            });
          }
          advanceAutoplay();
        } else if (autoplayRunningRef.current) {
          // If autoplay was running but preference is now disabled, stop it
          stopAutoplay();
        }
      };
      await audio.play();
      setIsPlaying(true);
      
      // If autoplay is enabled and not already running, set it up for when current verse ends
      if (autoplayEnabled && !isAutoplayRunning) {
        setIsAutoplayRunning(true);
        setAutoplayTarget({
          book: state.currentBook,
          chapter: state.currentChapter,
          verse: state.currentVerse
        });
      }
    } catch (err) {
      console.error('TTS playback failed:', err);
      setError({
        error: 'No se pudo reproducir el audio',
        details: err instanceof Error ? err.message : 'Error desconocido'
      });
    } finally {
      setIsTtsLoading(false);
    }
  };

  // Keep ref in sync to avoid stale closures during autoplay
  useEffect(() => {
    autoplayRunningRef.current = isAutoplayRunning;
  }, [isAutoplayRunning]);

  const stopAutoplay = () => {
    setIsAutoplayRunning(false);
    setAutoplayTarget(null);
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // ignore pause errors
      }
    }
    setIsPlaying(false);
  };

  const handleAutoplayToggle = (enabled: boolean) => {
    setAutoplayEnabled(enabled);
    localStorage.setItem('bible-app-autoplay-enabled', enabled.toString());
    if (!enabled && isAutoplayRunning) {
      stopAutoplay();
    }
  };

  const getNextReference = async (): Promise<{ book: string; chapter: number; verse: number } | null> => {
    const currentVerseCount = state.verses.length;
    if (state.currentVerse < currentVerseCount) {
      return { book: state.currentBook, chapter: state.currentChapter, verse: state.currentVerse + 1 };
    }

    const totalChapters = state.chapters.length;
    if (state.currentChapter < totalChapters) {
      // Move to next chapter, verse 1
      const nextChapter = state.currentChapter + 1;
      // Ensure verses list for next chapter; fall back to bibleService if not yet loaded
      let nextChapterVerseCount = state.verses.length;
      if (state.currentChapter !== nextChapter) {
        nextChapterVerseCount = await bibleService.getVersesInChapter(state.currentBook, nextChapter);
      }
      if (nextChapterVerseCount > 0) {
        return { book: state.currentBook, chapter: nextChapter, verse: 1 };
      }
    }

    // End of book
    return null;
  };

  const advanceAutoplay = async () => {
    if (!autoplayRunningRef.current || !autoplayEnabled) {
      if (!autoplayEnabled) {
        stopAutoplay();
      }
      return;
    }
    const nextRef = await getNextReference();
    if (!nextRef) {
      stopAutoplay();
      return;
    }

    setAutoplayTarget(nextRef);
    if (nextRef.chapter !== state.currentChapter) {
      setChapter(nextRef.chapter);
    }
    setVerse(nextRef.verse);
  };

  // Auto-play when the target verse is loaded and ready
  useEffect(() => {
    if (!isAutoplayRunning || !autoplayTarget) return;
    if (state.isLoading) return;

    const key = `${state.currentBook}-${state.currentChapter}-${state.currentVerse}`;
    const targetKey = `${autoplayTarget.book}-${autoplayTarget.chapter}-${autoplayTarget.verse}`;
    if (key !== targetKey) return;
    if (lastAutoplayPlayedRef.current === key) return;
    if (isTtsLoading) return;

    lastAutoplayPlayedRef.current = key;
    handlePlayAudio(state.verseText);
  }, [
    isAutoplayRunning,
    autoplayTarget,
    state.currentBook,
    state.currentChapter,
    state.currentVerse,
    state.isLoading,
    state.verseText,
    isTtsLoading
  ]);

  // Decorative Diamond Icon
  const DiamondIcon = () => (
    <span className="text-[#f5a623] text-xl animate-pulse-gold">✦</span>
  );

  const renderVerseOfDayContent = () => {
    if (state.isLoading) {
      return (
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <span className="text-white/60">Cargando el versículo del día...</span>
        </div>
      );
    }
    if (error) {
      return (
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
      );
    }
    return (
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
    );
  };

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
            {renderVerseOfDayContent()}
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

          {/* Audio Settings Section */}
          <GlassCard className="mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>🎵</span>
              <span>Configuración de Audio</span>
            </h3>
            <div className="space-y-4">
              {/* Autoplay Verses Toggle */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="text-white font-semibold block mb-1 cursor-pointer" onClick={() => handleAutoplayToggle(!autoplayEnabled)}>
                    Autoplay de Versículos
                  </label>
                  <p className="text-white/60 text-sm">
                    Reproducir automáticamente el siguiente versículo cuando termine el actual
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoplayEnabled}
                  onClick={() => handleAutoplayToggle(!autoplayEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:ring-offset-2 focus:ring-offset-[#1a1a2e] ${
                    autoplayEnabled ? 'bg-[#f5a623]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoplayEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
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
    <div className="min-h-screen text-white p-4 md:p-8 relative overflow-hidden">
      {/* SVG Filters for Liquid Glass Effects */}
      <div className="svg-filters">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
          <defs>
            <filter id="liquid-glass-refraction" x="-50%" y="-50%" width="200%" height="200%">
              {/* Base blur for glass effect */}
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />

              {/* Displacement for refraction effect */}
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
              <feDisplacementMap in="blur" in2="noise" scale="2" result="displaced" />

              {/* Specular rim lighting */}
              <feMorphology operator="dilate" radius="1" result="dilated" />
              <feComposite in="dilated" in2="displaced" operator="over" result="rim" />

              {/* Final composition */}
              <feColorMatrix type="matrix" values="1 0.1 0.1 0 0  0.1 1 0.1 0 0  0.1 0.1 1 0 0  0 0 0 1 0" />
            </filter>
          </defs>
        </svg>
      </div>

      {/* Aurora Background Layers */}
      <div className="aurora-bg"></div>
      <div className="noise-overlay"></div>
      <div className="vignette"></div>

      {/* Reader Stage - stable surface for content */}
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-gray-900/40 via-purple-900/30 to-violet-900/40 backdrop-blur-[2px]">
      {/* Header/Navigation */}
      <div className="sticky top-0 z-20 reader-topbar liquid-refraction">
        {/* Scroll Progress Indicator */}
        <div
          className="scroll-progress"
          style={{
            transform: `scaleX(${Math.min((state.currentVerse / Math.max(state.verses.length, 1)), 1)})`
          }}
        />

        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-6 items-center justify-between relative">
          {/* Zone 1: Now Reading */}
          <div className="flex flex-col items-center md:items-start">
            <div className="reading-title">
              {state.currentBook} {state.currentChapter}
            </div>
            <div className="text-white/60 text-sm">
              Versículo {state.currentVerse} • {state.verses.length} versículos totales
            </div>
          </div>

          {/* Zone 2: Navigation Pills */}
          <div className="flex items-center gap-3">
            {/* Book Selector */}
            <div className="nav-pill">
              <select value={state.currentBook} onChange={handleBookChange}>
                {state.books.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            {/* Chapter Selector */}
            <div className="nav-pill">
              <select value={state.currentChapter} onChange={handleChapterChange}>
                {state.chapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            {/* Verse Selector */}
            <div className="nav-pill">
              <select value={state.currentVerse} onChange={handleVerseChange}>
                {state.verses.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2">
            {/* Translation Toggle */}
            <GlassButton
              onClick={translateVerse}
              disabled={state.isTranslating}
              variant="liquid"
              size="sm"
              icon={state.isTranslating ? undefined : "🌐"}
            >
              {state.isTranslating ? 'Traduciendo...' : 'Traducir'}
            </GlassButton>

            {/* Search */}
            <GlassButton
              onClick={() => setSearchOpen(!searchOpen)}
              variant="liquid"
              size="sm"
              icon="🔍"
            />

            {/* Settings */}
            <GlassButton
              onClick={() => setViewMode('settings')}
              variant="liquid"
              size="sm"
              icon="⚙️"
            />

            {/* Connection Test (moved to overflow menu) */}
            <div className="relative">
              <GlassButton
                onClick={() => {/* toggle menu */}}
                variant="liquid"
                size="sm"
                icon="⋯"
              />
              {/* Overflow menu would go here */}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto mt-6">
        {state.isLoading && state.infiniteVerses.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <InfiniteVerseList />
        )}
      </main>

      {/* Debug Info Panel */}
      {debugInfo && (
        <div className="fixed bottom-4 right-4 w-80 bg-gray-800/90 backdrop-blur-md p-4 rounded-lg">
          {/* Debug content */}
        </div>
      )}

      {/* SettingsPanel and SearchPanel - assume existing */}
      {/* {settingsOpen && <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />} */}
      {searchOpen && (
        <ModalShell isOpen={searchOpen} onClose={() => setSearchOpen(false)}>
          <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </ModalShell>
      )}

    </div>
    </div>
  );
};
