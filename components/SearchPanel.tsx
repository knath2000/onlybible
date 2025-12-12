'use client';

import React, { useState, useEffect } from 'react';
import { useBible } from '../lib/context/BibleContext';
import { GlassCard, GlassButton, GlassInput } from './ui';

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ isOpen, onClose }) => {
  const { state, setBook, setChapter, setVerse, loadNextVerses } = useBible();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history
  useEffect(() => {
    const savedHistory = localStorage.getItem('bible-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      // For now, we'll simulate search with mock results
      // In a real implementation, this would call a search API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResults: SearchResult[] = [
        {
          book: 'Génesis',
          chapter: 1,
          verse: 1,
          text: 'En el principio creó Dios los cielos y la tierra.',
          reference: 'Génesis 1:1'
        },
        {
          book: 'Juan',
          chapter: 3,
          verse: 16,
          text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
          reference: 'Juan 3:16'
        },
        {
          book: 'Salmos',
          chapter: 23,
          verse: 1,
          text: 'Jehová es mi pastor; nada me faltará.',
          reference: 'Salmos 23:1'
        }
      ];

      setSearchResults(mockResults);
      
      // Add to search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('bible-search-history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('bible-search-history');
  };

  const scrollToResultWithLoading = (result: SearchResult) => {
    const anchorId = `${result.book}${result.chapter}:${result.verse}`;
    const maxAttempts = 20;
    const delayMs = 200;

    const attemptScroll = (attempt: number) => {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (attempt >= maxAttempts) {
        console.warn('Verse anchor not found after attempts:', anchorId);
        return;
      }

      // Ask the infinite query to load more verses if possible.
      // Internally this is gated by hasNextPage/isFetchingNextPage.
      loadNextVerses();
      window.setTimeout(() => attemptScroll(attempt + 1), delayMs);
    };

    // Small delay to allow book/chapter change to trigger a fresh query
    window.setTimeout(() => attemptScroll(0), 200);
  };

  const handleResultClick = (result: SearchResult) => {
    // Update navigation state first so the infinite list knows which
    // book/chapter/verse we care about.
    if (result.book !== state.currentBook || result.chapter !== state.currentChapter) {
      setBook(result.book);
      setChapter(result.chapter);
    }
    setVerse(result.verse);

    // Smooth-scroll to the corresponding infinite verse anchor,
    // loading additional chunks if needed until it appears.
    scrollToResultWithLoading(result);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard variant="liquid" elevation="mid" className="w-full max-w-2xl relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Close search"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-semibold text-white mb-4">Buscar en la Biblia</h2>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <GlassInput
              variant="liquid"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar palabras, frases o versículos..."
              className="flex-1"
            />
            <GlassButton
              variant="liquid"
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </GlassButton>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/80">Búsqueda Reciente</label>
                <GlassButton variant="liquid" onClick={clearHistory} className="text-xs">
                  Limpiar Historial
                </GlassButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, index) => (
                  <GlassButton
                    key={index}
                    variant="liquid"
                    elevation="low"
                    onClick={() => handleHistoryClick(query)}
                    className="text-sm"
                  >
                    {query}
                  </GlassButton>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div>
            <label className="text-sm text-white/80 mb-2 block">
              Resultados: {searchResults.length}
            </label>
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-white/80">Buscando "{searchQuery}"...</div>
              </div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="text-white/60 text-center py-8">
                No se encontraron resultados para "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <GlassCard
                    key={index}
                    variant="liquid"
                    elevation="low"
                    className="p-4 cursor-pointer hover:scale-[1.02] transition-transform"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gold-light font-medium">{result.reference}</span>
                      <GlassButton variant="liquid" size="sm" className="text-xs">Ir al Versículo</GlassButton>
                    </div>
                    <p className="text-white/90 leading-relaxed">{result.text}</p>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};