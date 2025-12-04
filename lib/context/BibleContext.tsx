'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { bibleService, translationService } from '../api';

interface BibleState {
  currentBook: string;
  currentChapter: number;
  currentVerse: number;
  verseText: string;
  translatedText: string;
  isLoading: boolean;
  isTranslating: boolean; // Separate loading state for translation
  error: string | null;
  books: string[];
  chapters: number[];
  verses: number[];
  showTranslation: boolean;
  translationMode: 'verse' | 'word';
}

interface BibleAction {
  type: string;
  payload?: any;
}

interface BibleContextType {
  state: BibleState;
  dispatch: React.Dispatch<BibleAction>;
  fetchVerse: (book: string, chapter: number, verse: number) => Promise<void>;
  translateVerse: () => Promise<void>;
  translateWord: (word: string) => Promise<string>;
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  setVerse: (verse: number) => void;
  toggleTranslation: () => void;
  setTranslationMode: (mode: 'verse' | 'word') => void;
}

const initialState: BibleState = {
  currentBook: 'Génesis',
  currentChapter: 1,
  currentVerse: 1,
  verseText: '',
  translatedText: '',
  isLoading: false,
  isTranslating: false,
  error: null,
  books: [],
  chapters: [],
  verses: [],
  showTranslation: false,
  translationMode: 'verse'
};

const BibleContext = createContext<BibleContextType | undefined>(undefined);

const bibleReducer = (state: BibleState, action: BibleAction): BibleState => {
  switch (action.type) {
    case 'SET_BOOK':
      return { ...state, currentBook: action.payload };
    case 'SET_CHAPTER':
      return { ...state, currentChapter: action.payload };
    case 'SET_VERSE':
      return { ...state, currentVerse: action.payload };
    case 'SET_VERSE_TEXT':
      // Clear translated text when verse changes (will be refetched on translate)
      return { ...state, verseText: action.payload, translatedText: '', showTranslation: false, isLoading: false };
    case 'SET_TRANSLATED_TEXT':
      return { ...state, translatedText: action.payload, isTranslating: false };
    case 'SET_TRANSLATING':
      return { ...state, isTranslating: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_BOOKS':
      return { ...state, books: action.payload };
    case 'SET_CHAPTERS':
      return { ...state, chapters: action.payload };
    case 'SET_VERSES':
      return { ...state, verses: action.payload };
    case 'TOGGLE_TRANSLATION':
      return { ...state, showTranslation: !state.showTranslation };
    case 'SET_TRANSLATION_MODE':
      return { ...state, translationMode: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const BibleProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(bibleReducer, initialState);

  const fetchVerse = async (book: string, chapter: number, verse: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const verseData = await bibleService.fetchVerse(book, chapter, verse);
      dispatch({ type: 'SET_VERSE_TEXT', payload: verseData.text });

      // Silently fetch English translation to enable accurate word-by-word hover
      // and instant toggle when user clicks Translate
      translationService.fetchEnglishVerse(book, chapter, verse)
        .then(englishData => {
          dispatch({ type: 'SET_TRANSLATED_TEXT', payload: englishData.text });
        })
        .catch(err => {
          console.warn('Background translation fetch failed:', err);
          // Non-critical error, just means hover won't be context-aware until retry
        });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const translateVerse = async () => {
    // If translation is already showing, just toggle it off
    if (state.showTranslation) {
      dispatch({ type: 'TOGGLE_TRANSLATION' });
      return;
    }

    // If we already have a translation cached, just show it
    if (state.translatedText) {
      dispatch({ type: 'TOGGLE_TRANSLATION' });
      return;
    }

    try {
      dispatch({ type: 'SET_TRANSLATING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Use the new translateVerse method that fetches English Bible verses
      const result = await translationService.translateVerse(
        state.currentBook,
        state.currentChapter,
        state.currentVerse,
        state.verseText
      );
      
      dispatch({ type: 'SET_TRANSLATED_TEXT', payload: result.translatedText });
      dispatch({ type: 'TOGGLE_TRANSLATION' }); // Show the translation
    } catch (error) {
      console.error('Translation error:', error);
      dispatch({ type: 'SET_TRANSLATING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Translation error' });
    }
  };

  const translateWord = async (word: string): Promise<string> => {
    try {
      // Pass the current translated text as context for better accuracy
      // This allows the service to pick the specific English word used in the KJV verse
      return await translationService.translateWord(word, 'es', 'en', state.translatedText);
    } catch (error) {
      console.error('Word translation error:', error);
      return word; // Return original word if translation fails
    }
  };

  const setBook = (book: string) => {
    dispatch({ type: 'SET_BOOK', payload: book });
  };

  const setChapter = (chapter: number) => {
    dispatch({ type: 'SET_CHAPTER', payload: chapter });
  };

  const setVerse = (verse: number) => {
    dispatch({ type: 'SET_VERSE', payload: verse });
  };

  const toggleTranslation = () => {
    dispatch({ type: 'TOGGLE_TRANSLATION' });
  };

  const setTranslationMode = (mode: 'verse' | 'word') => {
    dispatch({ type: 'SET_TRANSLATION_MODE', payload: mode });
  };

  // Initialize books on first load
  React.useEffect(() => {
    const initBooks = async () => {
      try {
        const books = await bibleService.getAvailableBooks();
        dispatch({ type: 'SET_BOOKS', payload: books });
      } catch (error) {
        console.error('Error loading books:', error);
      }
    };

    initBooks();
  }, []);

  // Update chapters when book changes
  React.useEffect(() => {
    const updateChapters = async () => {
      if (state.currentBook) {
        try {
          const chapters = await bibleService.getChaptersInBook(state.currentBook);
          const chapterArray = Array.from({ length: chapters }, (_, i) => i + 1);
          dispatch({ type: 'SET_CHAPTERS', payload: chapterArray });
          
          // Also load verses for the current chapter (usually 1)
          const verses = await bibleService.getVersesInChapter(state.currentBook, state.currentChapter);
          const verseArray = Array.from({ length: verses }, (_, i) => i + 1);
          dispatch({ type: 'SET_VERSES', payload: verseArray });
        } catch (error) {
          console.error('Error loading chapters:', error);
        }
      }
    };

    updateChapters();
  }, [state.currentBook]);

  // Update verses when chapter changes
  React.useEffect(() => {
    const updateVerses = async () => {
      if (state.currentBook && state.currentChapter) {
        try {
          const verses = await bibleService.getVersesInChapter(state.currentBook, state.currentChapter);
          const verseArray = Array.from({ length: verses }, (_, i) => i + 1);
          dispatch({ type: 'SET_VERSES', payload: verseArray });
        } catch (error) {
          console.error('Error loading verses:', error);
        }
      }
    };

    updateVerses();
  }, [state.currentBook, state.currentChapter]);

  return (
    <BibleContext.Provider
      value={{
        state,
        dispatch,
        fetchVerse,
        translateVerse,
        translateWord,
        setBook,
        setChapter,
        setVerse,
        toggleTranslation,
        setTranslationMode
      }}
    >
      {children}
    </BibleContext.Provider>
  );
};

export const useBible = () => {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
};