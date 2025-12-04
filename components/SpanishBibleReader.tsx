'use client';

import React, { useState, useEffect } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { GlassCard, GlassButton, GlassInput } from './ui';
import { LoadingSpinner } from './LoadingSpinner';
import { WordTranslationTooltip } from './WordTranslationTooltip';

interface BibleError {
  error: string;
  details?: string;
  bibleId?: string;
  passage?: string;
  status?: number;
}

export const SpanishBibleReader: React.FC = () => {
  const {
    state,
    fetchVerse,
    translateVerse,
    setBook,
    setChapter,
    setVerse,
    toggleTranslation,
    setTranslationMode
  } = useBible();

  const [error, setError] = useState<BibleError | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bible-app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setTranslationMode(parsed.translationMode || 'verse');
    }
  }, []);

  useEffect(() => {
    if (state.currentBook && state.currentChapter && state.currentVerse) {
      fetchVerse(state.currentBook, state.currentChapter, state.currentVerse).catch((err) => {
        console.error('Failed to fetch verse:', err);
        setError({
          error: 'Failed to fetch Bible content',
          details: err.message || 'Unknown error',
          bibleId: 'RVR60',
          passage: `${state.currentBook} ${state.currentChapter}:${state.currentVerse}`
        });
      });
    }
  }, [state.currentBook, state.currentChapter, state.currentVerse]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBook(e.target.value);
    setChapter(1);
    setVerse(1);
    setError(null);
    setDebugInfo(null);
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChapter(parseInt(e.target.value));
    setVerse(1);
    setError(null);
    setDebugInfo(null);
  };

  const handleVerseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVerse(parseInt(e.target.value));
    setError(null);
    setDebugInfo(null);
  };

  const handleTranslate = async () => {
    try {
      await translateVerse();
      setError(null);
    } catch (err) {
      console.error('Failed to translate verse:', err);
      setError({
        error: 'Failed to translate verse',
        details: err instanceof Error ? err.message : 'Unknown error'
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

  const testApiEndpoint = async () => {
    try {
      const response = await fetch(`/api/bible?bible=RVR60&passage=Juan+3:16&format=html`);
      const data = await response.json();
      
      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        data: data,
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        setError(data);
      } else {
        setError(null);
      }
    } catch (err) {
      setError({
        error: 'API endpoint test failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  };

  const clearError = () => {
    setError(null);
    setDebugInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Biblia en Español - Reina-Valera 1960</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
              <h3 className="text-red-300 font-semibold mb-2">Error: {error.error}</h3>
              {error.details && (
                <p className="text-red-200 text-sm mb-2">Detalles: {error.details}</p>
              )}
              {error.bibleId && error.passage && (
                <p className="text-red-200 text-sm mb-2">
                  Intentando: {error.bibleId} - {error.passage}
                </p>
              )}
              {error.status && (
                <p className="text-red-200 text-sm mb-2">Código de estado: {error.status}</p>
              )}
              <div className="flex gap-2">
                <GlassButton onClick={clearError} className="bg-red-500/30 hover:bg-red-500/40">
                  Limpiar Error
                </GlassButton>
                <GlassButton onClick={testApiEndpoint} className="bg-blue-500/30 hover:bg-blue-500/40">
                  Probar API
                </GlassButton>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Libro</label>
              <select
                value={state.currentBook}
                onChange={handleBookChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white"
              >
                {state.books.map((book) => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Capítulo</label>
              <select
                value={state.currentChapter}
                onChange={handleChapterChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white"
                disabled={state.chapters.length === 0}
              >
                {state.chapters.map((chapter) => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-1">Versículo</label>
              <select
                value={state.currentVerse}
                onChange={handleVerseChange}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white"
                disabled={state.verses.length === 0}
              >
                {state.verses.map((verse) => (
                  <option key={verse} value={verse}>{verse}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <GlassButton onClick={handlePrevVerse} disabled={state.currentVerse <= 1}>
              ← Anterior
            </GlassButton>
            <GlassButton onClick={handleNextVerse}>
              Siguiente →
            </GlassButton>
            <GlassButton onClick={handleTranslate} className="bg-green-500/30 hover:bg-green-500/40">
              {state.showTranslation ? 'Ocultar Traducción' : 'Traducir Versículo'}
            </GlassButton>
            <GlassButton onClick={testApiEndpoint} className="bg-blue-500/30 hover:bg-blue-500/40">
              Probar Conexión
            </GlassButton>
          </div>
        </GlassCard>

        <GlassCard>
          {state.isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
              <span className="ml-3 text-white">Cargando versículo...</span>
            </div>
          ) : error ? (
            <div className="text-red-400 p-4">
              <h3 className="text-lg font-semibold mb-2">No se pudo cargar el versículo</h3>
              <p className="mb-2">Error: {error.error}</p>
              {error.details && <p>Detalles: {error.details}</p>}
              <div className="mt-4">
                <h4 className="text-white/80 mb-2">Pasos para solucionar:</h4>
                <ul className="text-white/70 list-disc list-inside space-y-1">
                  <li>Verifica tu conexión a internet</li>
                  <li>Prueba el botón "Probar Conexión" para diagnosticar el problema</li>
                  <li>Si el error persiste, contacta al administrador</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {state.currentBook} {state.currentChapter}:{state.currentVerse}
                </h2>
                <p className="text-lg text-white leading-relaxed">
                  {state.verseText.split(' ').map((word, index) => (
                    <WordTranslationTooltip key={index} word={word}>
                      <span className="inline-block mx-0.5 hover:text-blue-300 transition-colors">
                        {word}
                      </span>
                    </WordTranslationTooltip>
                  ))}
                </p>
              </div>

              {state.showTranslation && state.translatedText && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-2">Traducción al Inglés:</h3>
                  <p className="text-white/90 leading-relaxed">
                    {state.translatedText}
                  </p>
                </div>
              )}
            </>
          )}

          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600/30">
              <h3 className="text-white font-semibold mb-2">Información de Depuración</h3>
              <pre className="text-gray-300 text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};