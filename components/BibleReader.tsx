'use client';

import React, { useEffect, useState } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { GlassCard, GlassButton } from './ui';
import { LoadingSpinner } from './LoadingSpinner';
import { WordTranslationTooltip } from './WordTranslationTooltip';
import { SettingsPanel } from './SettingsPanel';
import { SearchPanel } from './SearchPanel';

export const BibleReader: React.FC = () => {
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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bible-app-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setFontSize(parsed.fontSize || 16);
    }
  }, []);

  useEffect(() => {
    if (state.currentBook && state.currentChapter && state.currentVerse) {
      fetchVerse(state.currentBook, state.currentChapter, state.currentVerse);
    }
  }, [state.currentBook, state.currentChapter, state.currentVerse]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBook(e.target.value);
    setChapter(1); // Reset to chapter 1 when book changes
    setVerse(1); // Reset to verse 1 when book changes
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChapter(parseInt(e.target.value));
    setVerse(1); // Reset to verse 1 when chapter changes
  };

  const handleVerseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVerse(parseInt(e.target.value));
  };

  const handleTranslate = () => {
    translateVerse();
  };

  const handleNextVerse = () => {
    setVerse(state.currentVerse + 1);
  };

  const handlePrevVerse = () => {
    if (state.currentVerse > 1) {
      setVerse(state.currentVerse - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        <GlassCard className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Biblia en Español</h1>

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
            <GlassButton onClick={handleTranslate}>
              {state.showTranslation ? 'Ocultar Traducción' : 'Traducir Versículo'}
            </GlassButton>
            <GlassButton onClick={() => setSearchOpen(true)}>
              🔍 Buscar
            </GlassButton>
            <GlassButton onClick={() => setSettingsOpen(true)}>
              ⚙️ Configuración
            </GlassButton>
          </div>
        </GlassCard>

        <GlassCard>
          {state.isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : state.error ? (
            <div className="text-red-400 p-4">
              Error: {state.error}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {state.currentBook} {state.currentChapter}:{state.currentVerse}
                </h2>
                <p className="text-white leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
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
        </GlassCard>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Search Panel */}
      <SearchPanel
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};